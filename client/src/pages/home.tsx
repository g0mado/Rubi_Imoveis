import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import PropertyCard from "@/components/property-card";
import PropertyFilters from "@/components/property-filters";
import Footer from "@/components/footer";
import { Property } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState<any>({ status: 'disponivel' });

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/properties?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    }
  });

  const scrollToProperties = () => {
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`
          }}
        ></div>
        
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Imóveis de <span className="text-ruby-500">Luxo</span>
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 font-light">
            Descubra as propriedades mais exclusivas com a elegância que você merece
          </p>
          <Button 
            onClick={scrollToProperties}
            className="ruby-gradient text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity shadow-2xl"
          >
            Explorar Imóveis
          </Button>
        </div>
      </section>

      {/* Property Filters */}
      <PropertyFilters onFiltersChange={setFilters} />

      {/* Property Feed */}
      <section id="properties" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-serif font-bold text-black mb-4">
              Imóveis em Destaque
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Selecionamos as melhores propriedades para você
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <h4 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Nenhum imóvel encontrado
              </h4>
              <p className="text-gray-600">
                Tente ajustar os filtros para encontrar mais opções.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {properties.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                variant="outline"
                className="border-2 border-ruby-700 text-ruby-700 px-8 py-3 rounded-lg hover:bg-ruby-700 hover:text-white transition-colors font-semibold"
              >
                Ver Mais Imóveis
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
