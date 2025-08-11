import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Home, 
  Plus, 
  Heart, 
  Settings, 
  LogOut, 
  Edit, 
  Eye, 
  Trash2, 
  Search,
  TrendingUp,
  CheckCircle,
  DollarSign
} from "lucide-react";
import { authAPI } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/logo";
import AdminPropertyForm from "@/components/admin-property-form";
import { Property } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  // Get properties
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    }
  });

  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = authAPI.getToken();
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete property');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({ title: "Imóvel excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir imóvel", variant: "destructive" });
    }
  });

  const handleLogout = () => {
    authAPI.logout();
    setLocation("/admin/login");
  };

  const openEditForm = (property: Property) => {
    setSelectedProperty(property);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setSelectedProperty(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: properties.length,
    available: properties.filter(p => p.status === 'disponivel').length,
    sold: properties.filter(p => p.status === 'vendido').length,
    totalValue: properties.reduce((sum, p) => sum + parseFloat(p.price), 0)
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact'
    }).format(price);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <Logo className="w-6 h-6 mr-2" />
            <h1 className="text-lg font-serif font-bold">RUBI ADMIN</h1>
          </div>
          
          <nav className="space-y-2">
            <div className="flex items-center px-4 py-3 text-ruby-500 bg-ruby-900 bg-opacity-20 rounded-lg">
              <TrendingUp className="mr-3" size={20} />
              Dashboard
            </div>
            <div className="flex items-center px-4 py-3 text-gray-300 hover:text-ruby-500 hover:bg-ruby-900 hover:bg-opacity-20 rounded-lg cursor-pointer">
              <Home className="mr-3" size={20} />
              Imóveis ({stats.total})
            </div>
            <div className="flex items-center px-4 py-3 text-gray-300 hover:text-ruby-500 hover:bg-ruby-900 hover:bg-opacity-20 rounded-lg cursor-pointer" onClick={() => setLocation("/admin/users")}>
              <Settings className="mr-3" size={20} />
              Administradores
            </div>
          </nav>
        </div>
        
        <div className="mt-auto p-6">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="flex items-center text-gray-300 hover:text-white w-full justify-start"
          >
            <LogOut className="mr-3" size={20} />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-black">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Bem-vindo, Admin</span>
              <Button 
                onClick={openCreateForm}
                className="ruby-gradient text-white hover:opacity-90 font-medium"
              >
                <Plus className="mr-2" size={16} />
                Novo Imóvel
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Imóveis</p>
                  <p className="text-3xl font-bold text-black">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-ruby-100 rounded-lg flex items-center justify-center">
                  <Home className="text-ruby-700" size={24} />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disponíveis</p>
                  <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vendidos</p>
                  <p className="text-3xl font-bold text-ruby-700">{stats.sold}</p>
                </div>
                <div className="w-12 h-12 bg-ruby-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-ruby-700" size={24} />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-3xl font-bold text-gold-500">{formatPrice(stats.totalValue)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-gold-500" size={24} />
                </div>
              </div>
            </Card>
          </div>

          {/* Properties Management Table */}
          <Card className="shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif font-bold text-black">Gerenciar Imóveis</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Buscar imóveis..."
                      className="pl-10 focus:ring-2 focus:ring-ruby-500 focus:border-ruby-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 focus:ring-2 focus:ring-ruby-500 focus:border-ruby-500">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="vendido">Vendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imóvel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Região
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.area ? `${property.area}m²` : 'Área não informada'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.type === 'apartamento'
                            ? 'bg-ruby-100 text-ruby-800'
                            : property.type === 'casa'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(parseFloat(property.price))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.status === 'disponivel'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status === 'disponivel' ? 'Disponível' : 'Vendido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(property)}
                            className="text-ruby-600 hover:text-ruby-900"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/property/${property.id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(property.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredProperties.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">Nenhum imóvel encontrado.</p>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Property Form Modal */}
      <AdminPropertyForm
        property={selectedProperty}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProperty(undefined);
        }}
      />
    </div>
  );
}
