import { useState, useEffect, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, ArrowUpFromLine, Box } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { StockMovement } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAllProductsSimple, addStockMovement } from "@/services/api";
import { useStockMovementsQuery } from "@/features/stock/hooks/useStockMovementsQuery";
import { VirtualizedStockMovementsTable } from "@/features/stock/components/VirtualizedStockMovementsTable";
import { useQueryClient } from "@tanstack/react-query";
import { getStockMovementsPaged } from "@/services/api";
import { mapDbStockMovementRow } from "@/lib/mappers";

// Estado inicial agora vazio (dados reais virão do Supabase)
interface SimpleProduct {
  id: string;
  name: string;
}
interface DbSimpleProductRow {
  id: string;
  name: string;
}
// (interface DbStockMovementRow removida – não utilizada após refatoração de mapeamento)

import {
  stockMovementSchema,
  type StockMovementFormInput,
  type StockMovementFormValues,
} from "@/validation/stockMovementSchema";

const Stock = () => {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const queryClient = useQueryClient();
  // Loading de ação (registro de movimentação) independente do loading da query
  const [actionLoading, setActionLoading] = useState(false);

  const entryForm = useForm<
    StockMovementFormInput,
    unknown,
    StockMovementFormValues
  >({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: { productId: "", quantity: 1, reason: "" },
  });

  const exitForm = useForm<
    StockMovementFormInput,
    unknown,
    StockMovementFormValues
  >({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: { productId: "", quantity: 1, reason: "" },
  });

  // Carregar lista de produtos somente uma vez
  if (!products.length) {
    void getAllProductsSimple().then((prods) => {
      if (products.length) return;
      setProducts(
        (prods as DbSimpleProductRow[]).map((p) => ({ id: p.id, name: p.name }))
      );
    });
  }

  // Query de movimentações
  const {
    data: movementsData,
    isLoading,
    isFetching,
    error: movementsError,
  } = useStockMovementsQuery({ page, pageSize });
  const loading = isLoading || isFetching;
  const movements = (movementsData?.movements || []).map(mapDbStockMovementRow);
  const totalPages = movementsData?.totalPages || 1;
  const totalCount = movementsData?.count || movements.length;
  const useVirtualization = totalCount > 50 && pageSize >= 100; // ativar quando remodelado para página maior

  // Ajustar pageSize dinamicamente caso volume total seja grande
  useEffect(() => {
    if (movementsData?.count && movementsData.count > 50 && pageSize === 20) {
      // Reinicia para página 1 com pageSize maior para ganhos de virtualização
      setPageSize(200);
      setPage(1);
    }
  }, [movementsData?.count, pageSize]);

  // Prefetch manual disparado quando usuário chega em 70% do scroll
  const handleScrollThreshold = useCallback(
    (ratio: number) => {
      if (ratio < 0.7) return;
      if (page < totalPages) {
        const nextPage = page + 1;
        queryClient.prefetchQuery({
          queryKey: ["stockMovements", { page: nextPage, pageSize }],
          queryFn: async () => {
            const { data, count } = await getStockMovementsPaged({
              page: nextPage,
              pageSize,
            });
            const tp = count ? Math.max(1, Math.ceil(count / pageSize)) : 1;
            return {
              movements: data.map(mapDbStockMovementRow),
              count,
              totalPages: tp,
              page: nextPage,
              pageSize,
            };
          },
        });
      }
    },
    [page, totalPages, pageSize, queryClient]
  );
  if (movementsError && !error) {
    setError(
      movementsError instanceof Error
        ? movementsError.message
        : "Erro ao carregar movimentações"
    );
  }

  async function handleMovementSubmit(
    data: StockMovementFormValues,
    type: "ENTRADA" | "SAÍDA"
  ) {
    const product = products.find((p) => p.id === data.productId);
    if (!product) return;
    try {
      setActionLoading(true);
      await addStockMovement(data.productId, type, data.quantity, data.reason);
      toast.success(
        `${type === "ENTRADA" ? "Entrada" : "Saída"} de ${
          data.quantity
        } unidade(s) de "${product.name}" registrada.`
      );
      if (type === "ENTRADA") {
        entryForm.reset();
      } else {
        exitForm.reset();
      }
      // Invalidação automática ocorre via mutation (futura). Por enquanto rely no refetch da query.
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Falha ao registrar movimentação"
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen subtle-bg">
      <div className="absolute inset-0 pointer-events-none opacity-20 brand-gradient" />
      <div className="relative flex flex-col gap-6">
        <Tabs defaultValue="entry">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entry">
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Registrar Entrada
            </TabsTrigger>
            <TabsTrigger value="exit">
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Registrar Saída
            </TabsTrigger>
          </TabsList>
          <TabsContent value="entry">
            <Card>
              <CardHeader>
                <CardTitle>Nova Entrada de Estoque</CardTitle>
                <CardDescription>
                  Registre compras, devoluções ou outros tipos de entrada.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...entryForm}>
                  <form
                    onSubmit={entryForm.handleSubmit((data) =>
                      handleMovementSubmit(data, "ENTRADA")
                    )}
                    className="grid gap-6 sm:grid-cols-3"
                  >
                    <FormField<StockMovementFormInput>
                      control={entryForm.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produto</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={
                              typeof field.value === "string" ? field.value : ""
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField<StockMovementFormInput>
                      control={entryForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
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
                    <FormField<StockMovementFormInput>
                      control={entryForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Compra do fornecedor X"
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
                    <div className="sm:col-span-3 flex justify-end">
                      <Button type="submit" disabled={actionLoading}>
                        {actionLoading ? "Registrando..." : "Registrar Entrada"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="exit">
            <Card>
              <CardHeader>
                <CardTitle>Nova Saída de Estoque</CardTitle>
                <CardDescription>
                  Registre vendas, perdas, ou outros tipos de saída.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...exitForm}>
                  <form
                    onSubmit={exitForm.handleSubmit((data) =>
                      handleMovementSubmit(data, "SAÍDA")
                    )}
                    className="grid gap-6 sm:grid-cols-3"
                  >
                    <FormField<StockMovementFormInput>
                      control={exitForm.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produto</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={
                              typeof field.value === "string" ? field.value : ""
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField<StockMovementFormInput>
                      control={exitForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
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
                    <FormField<StockMovementFormInput>
                      control={exitForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Venda para cliente Y"
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
                    <div className="sm:col-span-3 flex justify-end">
                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Registrando..." : "Registrar Saída"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && <div className="text-destructive text-sm mb-2">{error}</div>}
        {loading && !error && (
          <div className="text-muted-foreground text-xs mb-2">
            Carregando dados...
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
            <CardDescription>
              Visualize todas as entradas e saídas de estoque.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                {useVirtualization ? (
                  <VirtualizedStockMovementsTable
                    movements={movements}
                    onScrollThreshold={handleScrollThreshold}
                  />
                ) : (
                  <TableBody>
                    {movements.length === 0 && !loading && !error && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          Nenhuma movimentação encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                    {movements.map((mov: StockMovement) => (
                      <TableRow key={mov.id}>
                        <TableCell className="font-medium">
                          {mov.productName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              mov.type === "ENTRADA" ? "default" : "destructive"
                            }
                          >
                            {mov.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{mov.reason}</TableCell>
                        <TableCell className="text-right font-medium">
                          {mov.quantity}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {format(
                            new Date(mov.createdAt),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stock;
