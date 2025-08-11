interface AuthToken {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthToken> => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro no login');
    }

    const data = await response.json();
    localStorage.setItem('admin_token', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
  },

  getToken: () => {
    return localStorage.getItem('admin_token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
};
