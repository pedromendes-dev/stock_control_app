import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
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
import { Boxes, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const registerSchema = z
  .object({
    email: z.string().email({ message: "Por favor, insira um email válido." }),
    password: z
      .string()
      .min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
    confirmPassword: z.string().min(1, { message: "Confirme sua senha." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password);
      // O feedback de sucesso é gerenciado pelo AuthContext
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).message
          : String(error ?? "Erro inesperado");
      toast.error("Falha ao criar conta", {
        description: message || "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background subtle-bg p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 pointer-events-none opacity-30 brand-gradient" />
      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-10 relative z-10">
        {/* Área de ilustração e branding para telas maiores */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="rounded-2xl panel-gradient p-6 backdrop-blur-md border border-border shadow-xl text-center max-w-sm">
            <img
              src="/illustration.svg"
              alt="Ilustração"
              className="mx-auto w-44 h-auto"
            />
            <h2 className="mt-4 text-2xl font-semibold text-foreground/90">
              Bem-vindo ao StockControl
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              Crie sua conta e comece a gerenciar seus produtos, estoque e
              fornecedores com facilidade.
            </p>
          </div>
        </div>
        <Card className="w-full max-w-md lg:max-w-lg bg-card/70 backdrop-blur-md border border-border shadow-2xl">
          <CardHeader className="text-center space-y-2 px-4 sm:px-6">
            <div className="flex justify-center items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Boxes className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                StockControl
              </h1>
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl text-foreground">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Preencha os dados abaixo para criar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 flex flex-col items-center"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => {
                    const error = form.formState.errors.email;
                    return (
                      <FormItem>
                        <FormControl>
                          <div className="relative w-full max-w-sm mx-auto">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                            </div>
                            <Input
                              id="email"
                              type="email"
                              placeholder=" "
                              {...field}
                              aria-required
                              aria-label="Email"
                              autoComplete="email"
                              aria-invalid={!!error}
                              aria-describedby={
                                error ? "email-error" : undefined
                              }
                              className={`peer pl-10 placeholder-transparent focus:ring-2 text-foreground
                                ${
                                  error
                                    ? "border-destructive bg-destructive/10 focus:ring-destructive/60 focus:border-destructive"
                                    : "border-border bg-muted/40 hover:border-muted focus:ring-primary/60 focus:border-primary"
                                }
                              `}
                            />
                            <Label
                              htmlFor="email"
                              className="absolute left-10 top-0 -translate-y-1/2 transform text-sm text-muted-foreground transition-all pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:translate-y-0 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-sm bg-background px-1 z-10"
                            >
                              Email
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage
                          id="email-error"
                          className="mt-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 px-2 py-1"
                        />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    const error = form.formState.errors.password;
                    return (
                      <FormItem>
                        <FormControl>
                          <div className="relative w-full max-w-sm mx-auto">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <Lock className="h-4 w-4" />
                            </div>
                            <Input
                              id="password"
                              type="password"
                              placeholder=" "
                              {...field}
                              aria-required
                              aria-label="Senha"
                              autoComplete="new-password"
                              aria-invalid={!!error}
                              aria-describedby={
                                error ? "password-error" : undefined
                              }
                              className={`peer pl-10 placeholder-transparent focus:ring-2 text-foreground
                                ${
                                  error
                                    ? "border-destructive bg-destructive/10 focus:ring-destructive/60 focus:border-destructive"
                                    : "border-border bg-muted/40 hover:border-muted focus:ring-primary/60 focus:border-primary"
                                }
                              `}
                            />
                            <Label
                              htmlFor="password"
                              className="absolute left-10 top-0 -translate-y-1/2 transform text-sm text-muted-foreground transition-all pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:translate-y-0 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-primary peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-primary bg-background px-1 z-10"
                            >
                              Senha
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage
                          id="password-error"
                          className="mt-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 px-2 py-1"
                        />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => {
                    const error = form.formState.errors.confirmPassword;
                    return (
                      <FormItem>
                        <FormControl>
                          <div className="relative w-full max-w-sm mx-auto">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <Lock className="h-4 w-4" />
                            </div>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder=" "
                              {...field}
                              aria-required
                              aria-label="Confirmar Senha"
                              autoComplete="new-password"
                              aria-invalid={!!error}
                              aria-describedby={
                                error ? "confirmPassword-error" : undefined
                              }
                              className={`peer pl-10 placeholder-transparent focus:ring-2 text-foreground
                                ${
                                  error
                                    ? "border-destructive bg-destructive/10 focus:ring-destructive/60 focus:border-destructive"
                                    : "border-border bg-muted/40 hover:border-muted focus:ring-primary/60 focus:border-primary"
                                }
                              `}
                            />
                            <Label
                              htmlFor="confirmPassword"
                              className="absolute left-10 top-0 -translate-y-1/2 transform text-sm text-muted-foreground transition-all pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:translate-y-0 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-primary peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-primary bg-background px-1 z-10"
                            >
                              Confirmar Senha
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage
                          id="confirmPassword-error"
                          className="mt-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 px-2 py-1"
                        />
                      </FormItem>
                    );
                  }}
                />

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full max-w-sm py-3 text-base sm:text-lg button-gradient hover:brightness-110 text-primary-foreground shadow-lg shadow-primary/30 focus-visible:ring-2 focus-visible:ring-primary mx-auto"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground w-full max-w-sm mx-auto">
                    Já tem uma conta?{" "}
                    <Link
                      to="/login"
                      className="text-primary hover:text-primary/80 hover:underline font-medium"
                    >
                      Fazer login
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
