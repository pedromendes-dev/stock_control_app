import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Boxes, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Login bem-sucedido! Redirecionando...");
      try {
        navigate("/dashboard");
      } catch {
        /* ignore */
      }
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).message
          : String(error ?? "Erro inesperado");
      toast.error("Falha no login", {
        description: message || "Verifique seu email e senha.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removido login social conforme requisito

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        {/* Branding / mensagem lateral (exibido somente em desktop para foco no formulário em mobile) */}
        <div className="hidden lg:flex flex-col gap-6 pr-4">
          <div className="flex items-center gap-3">
            <Boxes className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">StockControl</h1>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Organize inventário, analise métricas e tome decisões rápidas. Uma
              interface simples, objetiva e eficiente.
            </p>
          </div>
          <div className="rounded-xl border border-border p-6 bg-muted/40">
            <img
              src="/illustration.svg"
              alt="Ilustração estoque"
              className="w-56 h-auto mx-auto"
            />
          </div>
        </div>
        {/* Card de login */}
        <Card className="w-full max-w-md mx-auto shadow-sm border-border">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Entrar
            </CardTitle>
            <CardDescription>
              Acesse com suas credenciais para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => {
                    const error = form.formState.errors.email;
                    return (
                      <FormItem>
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="seu@email.com"
                              {...field}
                              autoComplete="email"
                              aria-invalid={!!error}
                              aria-describedby={
                                error ? "email-error" : undefined
                              }
                              className={`pl-10 ${
                                error
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : "border-border focus-visible:ring-primary"
                              }`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage
                          id="email-error"
                          className="text-xs mt-1"
                        />
                      </FormItem>
                    );
                  }}
                />
                {/* Senha */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    const error = form.formState.errors.password;
                    return (
                      <FormItem>
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          Senha
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              autoComplete="current-password"
                              aria-invalid={!!error}
                              aria-describedby={
                                error ? "password-error" : undefined
                              }
                              className={`pl-10 pr-10 ${
                                error
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : "border-border focus-visible:ring-primary"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                              aria-label={
                                showPassword ? "Ocultar senha" : "Mostrar senha"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage
                          id="password-error"
                          className="text-xs mt-1"
                        />
                      </FormItem>
                    );
                  }}
                />
                {/* Extras */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs sm:text-sm select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <span>Lembrar-me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                {/* Botão */}
                <Button
                  type="submit"
                  className="w-full h-11 font-medium shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Link
                    to="/registro"
                    className="text-primary hover:underline font-medium"
                  >
                    Registrar
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
