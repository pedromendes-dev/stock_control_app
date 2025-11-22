import { useSalesQuery } from "@/hooks/useSalesQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Sales() {
  const { data: sales, isLoading, error } = useSalesQuery();

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Carregando...</div>}
        {error && <div>Erro ao carregar vendas</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Produtos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(sales ?? []).map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.customers?.name}</TableCell>
                <TableCell>
                  {new Date(s.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>R$ {Number(s.total).toFixed(2)}</TableCell>
                <TableCell>
                  {(s.sale_items ?? []).map((item: any) => (
                    <div key={item.id}>
                      {item.products?.name} (x{item.quantity})
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sales && sales.length === 0 && (
          <div className="text-center py-8">Nenhuma venda encontrada.</div>
        )}
      </CardContent>
    </Card>
  );
}
