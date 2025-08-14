import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { authAPI } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/logo";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@rubiimoveisprime.com",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await authAPI.login(values.email, values.password);
      toast({ title: "Login realizado com sucesso!" });
      setLocation("/admin/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo className="mr-2" />
            <span className="text-xl font-serif font-bold">RUBI ADMIN</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-black">Admin Login</h2>
          <p className="text-gray-600">Acesso restrito para administradores</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      {...field} 
                      className="focus:ring-2 focus:ring-ruby-500 focus:border-ruby-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Adm123456789"
                      {...field} 
                      className="focus:ring-2 focus:ring-ruby-500 focus:border-ruby-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full ruby-gradient text-white hover:opacity-90 transition-opacity py-3"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar no Dashboard"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <Button 
            variant="link"
            onClick={() => setLocation("/")}
            className="text-gray-600 hover:text-ruby-700"
          >
            ← Voltar ao site
          </Button>
        </div>
      </Card>
    </div>
  );
}
