/**
 * Utilitários para gerenciar cache entre abas/páginas
 */

import { queryClient } from "./queryClient";

// Event listener para comunicação entre abas
export const setupCacheInvalidationListener = () => {
  // Escuta eventos de storage para comunicação entre abas
  window.addEventListener('storage', (e) => {
    if (e.key === 'property-updated' && e.newValue) {
      const propertyId = e.newValue;
      
      // Invalida o cache do imóvel específico
      queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      // Remove o item do storage para evitar loops
      localStorage.removeItem('property-updated');
    }
  });
};

// Função para notificar outras abas sobre atualizações
export const notifyPropertyUpdate = (propertyId: string) => {
  localStorage.setItem('property-updated', propertyId);
  
  // Remove imediatamente para permitir múltiplas notificações
  setTimeout(() => {
    localStorage.removeItem('property-updated');
  }, 100);
};

// Função para forçar refresh de um imóvel específico
export const forceRefreshProperty = (propertyId: string) => {
  queryClient.invalidateQueries({ queryKey: ['/api/properties', propertyId] });
  queryClient.refetchQueries({ queryKey: ['/api/properties', propertyId] });
  
  // Notifica outras abas também
  notifyPropertyUpdate(propertyId);
};