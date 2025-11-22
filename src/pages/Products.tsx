import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  FileDown,
  RefreshCcw,
  AlertTriangle,
  FileText,
  PackageOpen,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/types";
// Novos hooks com React Query
import { useProductsQuery } from "@/features/products/hooks/useProductsQuery";
import { useCategoriesQuery } from "@/features/categories/hooks/useCategoriesQuery";
import { mapDbCategoryRow } from "@/lib/mappers";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/features/products/hooks/useProductMutations";
import { exportProductsPDF } from "@/services/export";
import { toast } from "sonner";
import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/validation/productSchema";

const ITEMS_PER_PAGE = 10;

const Products = () => {
  // Categorias via React Query
  const { data: categoriesData } = useCategoriesQuery();
  const categories = (categoriesData?.categories ?? []).map(mapDbCategoryRow);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Estado local de paginação & busca
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const {
    data: queryData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useProductsQuery({ page, search, pageSize: ITEMS_PER_PAGE });
  const products = queryData?.products ?? [];
  const totalPages = queryData?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  // Benchmark simples de renderização da lista de produtos
  const renderStartRef = useRef<number | null>(null);
  if (renderStartRef.current === null) {
    renderStartRef.current = performance.now();
  }
  useEffect(() => {
    if (products.length) {
      const duration = performance.now() - (renderStartRef.current || 0);
      // eslint-disable-next-line no-console
      console.log(
        `[Benchmark] Render inicial de produtos (${
          products.length
        } itens): ${duration.toFixed(2)}ms`
      );
    }
  }, [products.length]);

  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      categoryId: "",
      price: 0,
      cost: 0,
      currentStock: 0,
      minStock: 10,
      maxStock: 100,
    },
  });

  // (Removido useEffect: categorias agora cacheadas pelo TanStack Query)

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  async function onSubmit(data: ProductFormValues) {
    try {
      setLoadingAction(true);
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description,
        sku: data.sku,
        categoryId: data.categoryId,
        price: data.price,
        cost: data.cost,
        currentStock: data.currentStock,
        minStock: data.minStock,
        maxStock: data.maxStock,
      });
      toast.success("Produto adicionado com sucesso");
      setIsDialogOpen(false);
      form.reset();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Falha ao adicionar produto"
      );
    } finally {
      setLoadingAction(false);
    }
  }

  async function onUpdate(data: ProductFormValues) {
    if (!editingProduct) return;
    try {
      setLoadingAction(true);
      await updateMutation.mutateAsync({
        id: editingProduct.id,
        name: data.name,
        description: data.description,
        sku: data.sku,
        categoryId: data.categoryId,
        price: data.price,
        cost: data.cost,
        currentStock: data.currentStock,
        minStock: data.minStock,
        maxStock: data.maxStock,
      });
      toast.success("Produto atualizado");
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Falha ao atualizar produto"
      );
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
      toast.success("Produto excluído");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao excluir produto");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            Gerencie seus produtos, adicione, edite e visualize detalhes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>
                {error instanceof Error
                  ? error.message
                  : "Erro ao carregar produtos"}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // reset para primeira página ao buscar
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const header = [
                    "id",
                    "nome",
                    "sku",
                    "categoria",
                    "preco",
                    "estoque",
                  ].join(";");
                  const lines = products.map((p) => {
                    const cat =
                      categories.find((c) => c.id === p.categoryId)?.name || "";
                    return [
                      p.id,
                      p.name,
                      p.sku,
                      cat,
                      p.price.toFixed(2),
                      p.currentStock,
                    ].join(";");
                  });
                  const csv = [header, ...lines].join("\n");
                  const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `produtos_${Date.now()}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("CSV exportado");
                }}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={() => exportProductsPDF(products, categories)}
                disabled={!products.length}
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="ghost"
                onClick={() => refetch()}
                disabled={loading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {loading ? "Atualizando..." : "Recarregar"}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Produto</DialogTitle>
                    <DialogDescription>
                      Preencha os detalhes do novo produto.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="grid gap-4 py-4 md:grid-cols-2"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Nome do Produto</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={
                                  field.value !== undefined
                                    ? String(field.value)
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={
                                  field.value !== undefined
                                    ? String(field.value)
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={
                                  field.value !== undefined
                                    ? String(field.value)
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={
                                field.value !== undefined
                                  ? String(field.value)
                                  : ""
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
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
                            <FormLabel>Preço (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                value={
                                  field.value !== undefined
                                    ? String(field.value)
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custo (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                value={
                                  field.value !== undefined
                                    ? String(field.value)
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currentStock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estoque Atual</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={
                                  field.value !== undefined
                                    ? String(field.value)
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="minStock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estoque Mínimo</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={
                                  field.value !== undefined
                                    ? String(field.value)
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={loadingAction}
                    >
                      Salvar Produto
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 && !loading && !error && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {products.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.sku}
                      </div>
                    </TableCell>
                    <TableCell>
                      {
                        categories.find((c) => c.id === product.categoryId)
                          ?.name
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          product.currentStock <= product.minStock
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {product.currentStock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingProduct(product);
                              form.reset({
                                name: product.name,
                                description: product.description,
                                sku: product.sku,
                                categoryId: product.categoryId,
                                price: product.price,
                                cost: product.cost,
                                currentStock: product.currentStock,
                                minStock: product.minStock,
                                maxStock: product.maxStock,
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                          >
                            {deletingId === product.id
                              ? "Excluindo..."
                              : "Excluir"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end items-center space-x-2 py-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.max(1, page - 1));
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                        isActive={page === p}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.min(totalPages, page + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setIsEditDialogOpen(false);
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Altere os campos necessários.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onUpdate)}
              className="grid gap-4 py-4 md:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ? String(field.value) : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ? String(field.value) : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ? String(field.value) : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ? String(field.value) : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ? String(field.value) : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ? String(field.value) : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ? String(field.value) : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={form.handleSubmit(onUpdate)}
              disabled={loadingAction}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Products;
