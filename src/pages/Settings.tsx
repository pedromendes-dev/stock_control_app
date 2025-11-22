import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/api";
import type { Category, Supplier } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Schemas
const profileSchema = z.object({
  name: z.string().min(3, "O nome é muito curto."),
  email: z.string().email("Email inválido."),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "A senha atual é necessária."),
  newPassword: z
    .string()
    .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
});
const categorySchema = z.object({
  name: z.string().min(2, "O nome da categoria é obrigatório."),
  description: z.string().optional(),
});
const supplierSchema = z.object({
  name: z.string().min(2, "O nome do fornecedor é obrigatório."),
  contact: z.string().min(2, "O nome do contato é obrigatório."),
  email: z.string().email("Email inválido."),
  phone: z.string().min(8, "Telefone inválido."),
  address: z.string().min(5, "Endereço inválido."),
});

// Remoção de mocks: agora usamos dados reais do Supabase.

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e do sistema.
        </p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="users" disabled>
            Usuários
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="categories">
          <CategorySettings />
        </TabsContent>
        <TabsContent value="suppliers">
          <SupplierSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = () => {
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "Usuário Admin", email: "admin@example.com" },
  });
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    console.log(data);
    toast.success("Perfil atualizado com sucesso!");
  };
  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    console.log(data);
    toast.success("Senha alterada com sucesso!");
    passwordForm.reset();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
          <CardDescription>
            Atualize o nome e o email da sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Salvar Alterações</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Para sua segurança, escolha uma senha forte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="secondary">
                Alterar Senha
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

// Category Settings Component
const CategorySettings = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setError(null);
      } catch (e: unknown) {
        const err = e as Error;
        setError(err.message || "Falha ao carregar categorias");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  const handleOpenForm = (category: Category | null) => {
    setEditingCategory(category);
    form.reset(
      category
        ? { name: category.name, description: category.description }
        : { name: "", description: "" }
    );
    setIsFormOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    try {
      setSaving(true);
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, {
          name: data.name,
          description: data.description ?? "",
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast.success(`Categoria "${data.name}" atualizada.`);
      } else {
        const created = await addCategory({
          name: data.name,
          description: data.description ?? "",
        });
        setCategories((prev) => [created, ...prev]);
        toast.success(`Categoria "${data.name}" adicionada.`);
      }
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message || "Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setDeleting(true);
      await deleteCategory(deleteCandidate.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteCandidate.id));
      toast.error(`Categoria "${deleteCandidate.name}" excluída.`);
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message || "Erro ao excluir categoria");
    } finally {
      setDeleteCandidate(null);
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Categorias de Produtos</CardTitle>
            <CardDescription>
              Adicione, edite ou remova categorias de produtos.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Categoria
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="text-sm text-muted-foreground px-2 py-2">
            Carregando categorias...
          </p>
        )}
        {error && <p className="text-sm text-destructive px-2 py-2">{error}</p>}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading &&
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.description}
                    </TableCell>
                    <TableCell>
                      {cat.createdAt
                        ? format(new Date(cat.createdAt), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenForm(cat)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteCandidate(cat)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar" : "Nova"} Categoria
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da categoria.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteCandidate !== null}
        onOpenChange={() => setDeleteCandidate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
              categoria "{deleteCandidate?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Continuar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

// Supplier Settings Component
const SupplierSettings = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSuppliers();
        setSuppliers(data);
        setError(null);
      } catch (e: unknown) {
        const err = e as Error;
        setError(err.message || "Falha ao carregar fornecedores");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const form = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: "", contact: "", email: "", phone: "", address: "" },
  });

  const handleOpenForm = (supplier: Supplier | null) => {
    setEditingSupplier(supplier);
    form.reset(
      supplier
        ? supplier
        : { name: "", contact: "", email: "", phone: "", address: "" }
    );
    setIsFormOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof supplierSchema>) => {
    try {
      setSaving(true);
      if (editingSupplier) {
        const updated = await updateSupplier(editingSupplier.id, {
          name: data.name,
          contact: data.contact,
          email: data.email,
          phone: data.phone,
          address: data.address,
        });
        setSuppliers((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        toast.success(`Fornecedor "${data.name}" atualizado.`);
      } else {
        const created = await addSupplier({
          name: data.name,
          contact: data.contact,
          email: data.email,
          phone: data.phone,
          address: data.address,
        });
        setSuppliers((prev) => [created, ...prev]);
        toast.success(`Fornecedor "${data.name}" adicionado.`);
      }
      setIsFormOpen(false);
      setEditingSupplier(null);
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message || "Erro ao salvar fornecedor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setDeleting(true);
      await deleteSupplier(deleteCandidate.id);
      setSuppliers((prev) => prev.filter((s) => s.id !== deleteCandidate.id));
      toast.error(`Fornecedor "${deleteCandidate.name}" excluído.`);
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message || "Erro ao excluir fornecedor");
    } finally {
      setDeleteCandidate(null);
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Fornecedores</CardTitle>
            <CardDescription>
              Gerencie os fornecedores dos seus produtos.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Fornecedor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="text-sm text-muted-foreground px-2 py-2">
            Carregando fornecedores...
          </p>
        )}
        {error && <p className="text-sm text-destructive px-2 py-2">{error}</p>}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading &&
                suppliers.map((sup) => (
                  <TableRow key={sup.id}>
                    <TableCell className="font-medium">{sup.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {sup.contact}
                    </TableCell>
                    <TableCell>{sup.email}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenForm(sup)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteCandidate(sup)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Editar" : "Novo"} Fornecedor
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do fornecedor.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-2 gap-4 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="col-span-2">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteCandidate !== null}
        onOpenChange={() => setDeleteCandidate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              fornecedor "{deleteCandidate?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Continuar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default Settings;
