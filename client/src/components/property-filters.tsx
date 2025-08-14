import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

interface PropertyFiltersProps {
  onFiltersChange: (filters: {
    type?: string;
    location?: string;
    maxPrice?: number;
    status?: string;
  }) => void;
}

export default function PropertyFilters({ onFiltersChange }: PropertyFiltersProps) {
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
    maxPrice: 'all',
    status: 'disponivel'
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const apiFilters: any = {};
    if (newFilters.type && newFilters.type !== 'all') apiFilters.type = newFilters.type;
    if (newFilters.location && newFilters.location !== 'all') apiFilters.location = newFilters.location;
    if (newFilters.maxPrice && newFilters.maxPrice !== 'all') apiFilters.maxPrice = parseInt(newFilters.maxPrice);
    if (newFilters.status && newFilters.status !== 'all') apiFilters.status = newFilters.status;
    
    onFiltersChange(apiFilters);
  };

  const clearFilters = () => {
    const resetFilters = { type: 'all', location: 'all', maxPrice: 'all', status: 'disponivel' };
    setFilters(resetFilters);
    onFiltersChange({ status: 'disponivel' });
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-gray-50 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-serif font-bold text-center mb-8 text-black">
            Encontre seu Imóvel Ideal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Imóvel
              </label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="focus:ring-2 focus:ring-ruby-500 focus:border-ruby-500">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="sitio">Sítio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Região
              </label>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger className="focus:ring-2 focus:ring-ruby-500 focus:border-ruby-500">
                  <SelectValue placeholder="Todas as regiões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as regiões</SelectItem>
                  <SelectItem value="centro">Centro</SelectItem>
                  <SelectItem value="zona-sul">Zona Sul</SelectItem>
                  <SelectItem value="zona-norte">Zona Norte</SelectItem>
                  <SelectItem value="zona-oeste">Zona Oeste</SelectItem>
                  <SelectItem value="zona-rural">Zona Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Máximo
              </label>
              <Select value={filters.maxPrice} onValueChange={(value) => handleFilterChange('maxPrice', value)}>
                <SelectTrigger className="focus:ring-2 focus:ring-ruby-500 focus:border-ruby-500">
                  <SelectValue placeholder="Sem limite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sem limite</SelectItem>
                  <SelectItem value="500000">Até R$ 500.000,00</SelectItem>
                  <SelectItem value="1000000">Até R$ 1.000.000,00</SelectItem>
                  <SelectItem value="2000000">Até R$ 2.000.000,00</SelectItem>
                  <SelectItem value="5000000">Até R$ 5.000.000,00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="focus:ring-2 focus:ring-ruby-500 focus:border-ruby-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button 
                className="flex-1 ruby-gradient text-white hover:opacity-90 transition-opacity"
              >
                <Search className="mr-2" size={16} />
                Buscar
              </Button>
              <Button 
                variant="outline"
                onClick={clearFilters}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Limpar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
