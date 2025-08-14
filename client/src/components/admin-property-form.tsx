import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { PriceInput } from "@/components/ui/price-input";
import { X, Upload, Trash2 } from "lucide-react";
import { insertPropertySchema, type Property } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { notifyPropertyUpdate } from "@/lib/cache-utils";

const formSchema = insertPropertySchema.extend({
  price: z.string().min(1, "Preço é obrigatório"),
  area: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  parkingSpaces: z.string().optional(),
});

interface AdminPropertyFormProps {
  property?: Property;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPropertyForm({ property, isOpen, onClose }: AdminPropertyFormProps) {
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>(property?.images || []);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Chave para salvar dados do formulário
  const formStorageKey = `admin-property-form-${property?.id || 'new'}`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: property?.title || "",
      type: property?.type || "",
      description: property?.description || "",
      location: property?.location || "",
      price: property?.price || "",
      status: property?.status || "disponivel",
      area: property?.area || "",
      bedrooms: property?.bedrooms?.toString() || "",
      bathrooms: property?.bathrooms?.toString() || "",
      parkingSpaces: property?.parkingSpaces?.toString() || "",
    },
  });

  // Salva automaticamente os dados do formulário
  const saveFormData = (data: any) => {
    localStorage.setItem(formStorageKey, JSON.stringify(data));
  };

  // Recupera dados salvos do formulário
  const loadFormData = () => {
    try {
      const savedData = localStorage.getItem(formStorageKey);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos do formulário:', error);
    }
    return null;
  };

  // Limpa dados salvos do formulário
  const clearFormData = () => {
    localStorage.removeItem(formStorageKey);
  };

  // Carrega dados salvos quando o formulário abre
  useEffect(() => {
    if (isOpen && property) {
      const savedData = loadFormData();
      if (savedData) {
        // Pergunta se o usuário quer recuperar os dados salvos
        const shouldRestore = window.confirm(
          'Encontramos dados não salvos para este imóvel. Deseja recuperá-los?'
        );
        
        if (shouldRestore) {
          form.reset(savedData);
        } else {
          clearFormData();
        }
      }
    }
  }, [isOpen, property, form]);

  // Watch para mudanças no formulário e salvar automaticamente
  const watchedValues = form.watch();
  useEffect(() => {
    if (isOpen && property) {
      // Salva apenas se houver mudanças reais nos dados
      const hasChanges = Object.keys(watchedValues).some(key => {
        const currentValue = watchedValues[key as keyof typeof watchedValues];
        const originalValue = property[key as keyof Property];
        return currentValue !== originalValue;
      });

      if (hasChanges) {
        saveFormData(watchedValues);
      }
    }
  }, [watchedValues, isOpen, property]);

  // Função para verificar se há mudanças não salvas
  const hasUnsavedChanges = () => {
    if (!property) return false;
    return Object.keys(watchedValues).some(key => {
      const currentValue = watchedValues[key as keyof typeof watchedValues];
      const originalValue = property[key as keyof Property];
      return currentValue !== originalValue;
    });
  };

  // Função personalizada para fechar com confirmação
  const handleClose = () => {
    if (hasUnsavedChanges()) {
      const shouldClose = window.confirm(
        'Você tem alterações não salvas. Deseja realmente fechar sem salvar?'
      );
      
      if (shouldClose) {
        clearFormData();
        onClose();
      }
    } else {
      onClose();
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      if (!response.ok) throw new Error('Erro ao criar imóvel');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({ title: "Imóvel criado com sucesso!" });
      clearFormData(); // Limpa dados salvos após sucesso
      onClose();
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao criar imóvel", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/properties/${property?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      if (!response.ok) throw new Error('Erro ao atualizar imóvel');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      // Invalida também o cache específico do imóvel na página de detalhes
      if (property?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/properties', property.id] });
        // Notifica outras abas sobre a atualização
        notifyPropertyUpdate(property.id);
      }
      toast({ title: "Imóvel atualizado com sucesso!" });
      clearFormData(); // Limpa dados salvos após sucesso
      onClose();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar imóvel", variant: "destructive" });
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    
    // Add form fields
    formData.append('title', values.title);
    formData.append('type', values.type);
    formData.append('description', values.description);
    formData.append('location', values.location);
    formData.append('price', values.price);
    formData.append('status', values.status || 'disponivel');
    
    if (values.area) formData.append('area', values.area);
    if (values.bedrooms) formData.append('bedrooms', values.bedrooms);
    if (values.bathrooms) formData.append('bathrooms', values.bathrooms);
    if (values.parkingSpaces) formData.append('parkingSpaces', values.parkingSpaces);
    
    // Add existing images if updating
    if (property && existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }
    
    // Add new images
    if (selectedImages) {
      for (let i = 0; i < selectedImages.length; i++) {
        formData.append('images', selectedImages[i]);
      }
    }
    
    if (property) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-serif font-bold text-black">
                {property ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
              </h2>
              {hasUnsavedChanges() && (
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  Alterações não salvas
                </div>
              )}
            </div>
            <Button variant="ghost" onClick={handleClose}>
              <X size={24} />
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Apartamento Premium Vista Mar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartamento">Apartamento</SelectItem>
                          <SelectItem value="casa">Casa</SelectItem>
                          <SelectItem value="sitio">Sítio</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Região *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a região" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="centro">Centro</SelectItem>
                          <SelectItem value="zona-sul">Zona Sul</SelectItem>
                          <SelectItem value="zona-norte">Zona Norte</SelectItem>
                          <SelectItem value="zona-oeste">Zona Oeste</SelectItem>
                          <SelectItem value="zona-rural">Zona Rural</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor *</FormLabel>
                      <FormControl>
                        <PriceInput 
                          value={field.value} 
                          onChange={field.onChange}
                          placeholder="R$ 850.000,00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="180" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quartos</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banheiros</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parkingSpaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vagas</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={4} 
                        placeholder="Descreva o imóvel detalhadamente..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Existing Images */}
              {property && existingImages.length > 0 && (
                <div>
                  <FormLabel>Imagens Atuais</FormLabel>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-2">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6"
                          onClick={() => removeExistingImage(index)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <FormLabel>
                  {property ? 'Novas Fotos (máx. 12)' : 'Fotos (máx. 12) *'}
                </FormLabel>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Arraste e solte as fotos aqui ou</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedImages(e.target.files)}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    clique para selecionar
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG até 5MB cada (máximo 12 fotos)
                  </p>
                </div>
                {selectedImages && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedImages.length} arquivo(s) selecionado(s)
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="vendido">Vendido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="ruby-gradient text-white hover:opacity-90"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Salvando...' 
                    : property ? 'Atualizar Imóvel' : 'Cadastrar Imóvel'
                  }
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
