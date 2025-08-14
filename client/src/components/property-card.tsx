import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { Property } from "@shared/schema";
import { useFavorites } from "@/hooks/use-favorites";
import { formatCurrency } from "@/lib/price-utils";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(property.id);
  


  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'apartamento':
        return 'text-ruby-700 bg-ruby-50';
      case 'casa':
        return 'text-blue-700 bg-blue-50';
      case 'sitio':
        return 'text-green-700 bg-green-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <Card className="property-card bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl">
      <div className="relative">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sem imagem</span>
          </div>
        )}
        
        <div className="absolute top-4 right-4">
          <button 
            className={`heart-icon bg-white bg-opacity-90 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isFav ? 'text-ruby-700' : 'text-gray-600 hover:text-ruby-700'
            }`}
            onClick={() => toggleFavorite(property.id)}
          >
            <Heart className={isFav ? "fill-current" : ""} size={20} />
          </button>
        </div>
        
        <div className="absolute bottom-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.status === 'disponivel' 
              ? 'bg-ruby-700 text-white' 
              : 'bg-green-600 text-white'
          }`}>
            {property.status === 'disponivel' ? 'Disponível' : 'Vendido'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${getTypeColor(property.type)}`}>
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          </span>
          <span className="text-sm text-gray-500">{property.location}</span>
        </div>
        
        <h4 className="text-xl font-serif font-bold text-black mb-2 line-clamp-2">
          {property.title}
        </h4>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-ruby-700">
            {formatCurrency(property.price)}
          </span>
          <Link href={`/property/${property.id}`}>
            <Button className="bg-black text-white hover:bg-gray-800 transition-colors">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
