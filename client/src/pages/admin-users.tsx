import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Shield,
  Crown
} from "lucide-react";
import { authAPI } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Admin, insertAdminSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const adminFormSchema = insertAdminSchema.extend({
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type AdminFormData = z.infer<typeof adminFormSchema>;

export default function AdminUsers() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      permissions: [],
      isActive: true,
    },
  });

  // Get all admins
  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ['/api/admins'],
    queryFn: async () => {
      const token = authAPI.getToken();
      const response = await fetch('/api/admins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch admins');
      return response.json();
    }
  });

  // Create admin mutation
  const createMutation = useMutation({
    mutationFn: async (data: AdminFormData) => {
      const token = authAPI.getToken();
      const { confirmPassword, ...adminData } = data;
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminData)
      });
      if (!response.ok) throw new Error('Failed to create admin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admins'] });
      setIsFormOpen(false);
      form.reset();
      toast({ title: "Administrador criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar administrador", variant: "destructive" });
    }
  });

  // Update admin mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminFormData> }) => {
      const token = authAPI.getToken();
      const { confirmPassword, ...adminData } = data;
      const response = await fetch(`/api/admins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminData)
      });
      if (!response.ok) throw new Error('Failed to update admin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admins'] });
      setIsFormOpen(false);
      setSelectedAdmin(undefined);
      form.reset();
      toast({ title: "Administrador atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar administrador", variant: "destructive" });
    }
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const token = authAPI.getToken();
      const response = await fetch(`/api/admins/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Failed to toggle admin status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admins'] });
      toast({ title: "Status do administrador alterado!" });
    },
    onError: () => {
      toast({ title: "Erro ao alterar status", variant: "destructive" });
    }
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = authAPI.getToken();
      const response = await fetch(`/api/admins/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete admin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admins'] });
      toast({ title: "Administrador excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir administrador", variant: "destructive" });
    }
  });

  const openCreateForm = () => {
    setSelectedAdmin(undefined);
    form.reset();
    setIsFormOpen(true);
  };

  const openEditForm = (admin: Admin) => {
    setSelectedAdmin(admin);
    form.reset({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive,
      password: "",
      confirmPassword: ""
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (data: AdminFormData) => {
    if (selectedAdmin) {
      updateMutation.mutate({ id: selectedAdmin.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este administrador?')) {
      deleteMutation.mutate(id);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'super_admin') {
      return <Badge variant="destructive" className="bg-ruby-500"><Crown size={12} className="mr-1" />Super Admin</Badge>;
    }
    return <Badge variant="secondary"><Shield size={12} className="mr-1" />Admin</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="mr-3 text-ruby-500" size={24} />
          <h1 className="text-2xl font-serif font-bold text-black">Gerenciar Administradores</h1>
        </div>
        <Button onClick={openCreateForm} className="bg-ruby-500 hover:bg-ruby-600 text-white">
          <Plus size={16} className="mr-2" />
          Novo Administrador
        </Button>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{admin.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(admin.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={admin.isActive ? "default" : "secondary"} className={admin.isActive ? "bg-green-500" : ""}>
                      {admin.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(admin)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(admin.id, admin.isActive)}
                      className={admin.isActive ? "text-red-600 border-red-600 hover:bg-red-50" : "text-green-600 border-green-600 hover:bg-green-50"}
                    >
                      {admin.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAdmin ? 'Editar Administrador' : 'Novo Administrador'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedAdmin ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-ruby-500 hover:bg-ruby-600 text-white"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}