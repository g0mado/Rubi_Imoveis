/**
 * Utilitários para formatação de preços em Real Brasileiro
 */

/**
 * Formata um número como moeda brasileira
 */
export const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '')) : value;
  
  if (isNaN(numericValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

/**
 * Formata um número como moeda compacta (K, Mi, Bi)
 */
export const formatCompactCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '')) : value;
  
  if (isNaN(numericValue)) return 'R$ 0';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(numericValue);
};

/**
 * Remove formatação e retorna apenas os números
 */
export const parseCurrency = (formattedValue: string): string => {
  return formattedValue.replace(/[^\d]/g, '');
};

/**
 * Formata entrada de preço em tempo real
 */
export const formatPriceInput = (value: string): string => {
  // Remove tudo que não é número
  const numericValue = value.replace(/\D/g, '');
  
  if (!numericValue) return '';
  
  // Converte para número (centavos)
  const cents = parseInt(numericValue);
  const reais = cents / 100;
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
};

/**
 * Converte string formatada para valor numérico em string
 */
export const currencyToValue = (formattedValue: string): string => {
  const numericValue = formattedValue.replace(/[^\d]/g, '');
  if (!numericValue) return '0';
  
  const cents = parseInt(numericValue);
  const reais = cents / 100;
  
  return reais.toString();
};