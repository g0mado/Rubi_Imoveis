import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bed, Bath, Car, Ruler, MapPin, Share, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PropertyGallery from "@/components/property-gallery";
import { Property } from "@shared/schema";
import { useFavorites } from "@/hooks/use-favorites";
import { formatCurrency } from "@/lib/price-utils";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ['/api/properties', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Imóvel não encontrado</h1>
          <p className="text-gray-600">O imóvel que você está procurando não existe ou foi removido.</p>
        </div>
      </div>
    );
  }



  const openGallery = (index: number = 0) => {
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  const generateWhatsAppLink = () => {
    const message = `Olá! Tenho interesse no imóvel: ${property.title} - ${formatCurrency(property.price)}. Link: ${window.location.href}`;
    return `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
  };

  const isFav = isFavorite(property.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Property Images */}
        <div className="mb-8">
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-96">
              {/* Main Image */}
              <div 
                className="lg:col-span-3 cursor-pointer rounded-2xl overflow-hidden"
                onClick={() => openGallery(0)}
              >
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              
              {/* Side Images */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {property.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="cursor-pointer rounded-lg overflow-hidden relative"
                    onClick={() => openGallery(index + 1)}
                  >
                    <img
                      src={image}
                      alt={`${property.title} - Imagem ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    {index === 3 && property.images && property.images.length > 5 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          +{property.images ? property.images.length - 5 : 0} fotos
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
              <span className="text-gray-500">Sem imagens disponíveis</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.type === 'apartamento' 
                      ? 'text-ruby-700 bg-ruby-50' 
                      : property.type === 'casa' 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-green-700 bg-green-50'
                  }`}>
                    {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  </span>
                  <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === 'disponivel' 
                      ? 'bg-ruby-700 text-white' 
                      : 'bg-green-600 text-white'
                  }`}>
                    {property.status === 'disponivel' ? 'Disponível' : 'Vendido'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`heart-icon transition-all ${isFav ? 'text-ruby-700' : 'text-gray-400'}`}
                  onClick={() => toggleFavorite(property.id)}
                >
                  <Heart className={isFav ? "fill-current" : ""} size={24} />
                </Button>
              </div>

              <h1 className="text-3xl font-serif font-bold text-black mb-4">
                {property.title}
              </h1>

              <p className="text-3xl font-bold text-ruby-700 mb-6">
                {formatCurrency(property.price)}
              </p>

              {/* Property Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {property.bedrooms && (
                  <div className="text-center">
                    <Bed className="mx-auto text-ruby-700 text-xl mb-2" />
                    <p className="text-sm text-gray-600">{property.bedrooms} Quartos</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <Bath className="mx-auto text-ruby-700 text-xl mb-2" />
                    <p className="text-sm text-gray-600">{property.bathrooms} Banheiros</p>
                  </div>
                )}
                {property.parkingSpaces && (
                  <div className="text-center">
                    <Car className="mx-auto text-ruby-700 text-xl mb-2" />
                    <p className="text-sm text-gray-600">{property.parkingSpaces} Vagas</p>
                  </div>
                )}
                {property.area && (
                  <div className="text-center">
                    <Ruler className="mx-auto text-ruby-700 text-xl mb-2" />
                    <p className="text-sm text-gray-600">{property.area}m²</p>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-serif font-bold mb-4">Descrição</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-serif font-bold mb-4">Localização</h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="text-ruby-700 mr-2" size={20} />
                  {property.location}
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="text-xl font-serif font-bold mb-6 text-center">
                Interessado neste imóvel?
              </h3>
              
              <div className="space-y-4">
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors py-3">
                    <MessageCircle className="mr-2" size={20} />
                    Contato via WhatsApp
                  </Button>
                </a>
                
                <Button 
                  variant="outline"
                  className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors py-3"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: property.title,
                        text: `Confira este imóvel: ${property.title}`,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      // You could add a toast notification here
                    }
                  }}
                >
                  <Share className="mr-2" size={20} />
                  Compartilhar
                </Button>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">RUBI IMÓVEIS PRIME</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Especialistas em imóveis de luxo
                </p>
                <div className="text-sm text-gray-600">
                  <p>📞 (11) 99999-9999</p>
                  <p>✉️ contato@rubiimoveis.com</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Property Gallery Modal */}
      {property.images && property.images.length > 0 && (
        <PropertyGallery
          images={property.images}
          title={property.title}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          startIndex={galleryStartIndex}
        />
      )}

      <Footer />
    </div>
  );
}
