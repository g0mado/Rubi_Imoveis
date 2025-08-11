import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useFavorites() {
  const [sessionId, setSessionId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get or create session ID
  useEffect(() => {
    const getSessionId = async () => {
      let storedSessionId = localStorage.getItem('session_id');
      
      if (!storedSessionId) {
        const response = await fetch('/api/session');
        const data = await response.json();
        storedSessionId = data.sessionId;
        localStorage.setItem('session_id', storedSessionId);
      }
      
      setSessionId(storedSessionId || '');
    };

    getSessionId();
  }, []);

  // Get favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ['/api/favorites', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const response = await fetch('/api/favorites', {
        headers: {
          'x-session-id': sessionId
        }
      });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return response.json();
    }
  });

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({ propertyId })
      });
      if (!response.ok) throw new Error('Failed to add favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', sessionId] });
      toast({ title: "Imóvel adicionado aos favoritos!" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar favorito", variant: "destructive" });
    }
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/favorites/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId
        }
      });
      if (!response.ok) throw new Error('Failed to remove favorite');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', sessionId] });
      toast({ title: "Imóvel removido dos favoritos!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover favorito", variant: "destructive" });
    }
  });

  const isFavorite = (propertyId: string) => {
    return favorites.some((fav: any) => fav.propertyId === propertyId);
  };

  const toggleFavorite = (propertyId: string) => {
    if (!sessionId) return;
    
    if (isFavorite(propertyId)) {
      removeFavoriteMutation.mutate(propertyId);
    } else {
      addFavoriteMutation.mutate(propertyId);
    }
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading: addFavoriteMutation.isPending || removeFavoriteMutation.isPending
  };
}
