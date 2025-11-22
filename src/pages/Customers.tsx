import { useCustomersQuery } from "@/hooks/useCustomersQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Customers() {
  const { data: customers, isLoading, error } = useCustomersQuery();

  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Carregando...</div>}
        {error && <div>Erro ao carregar clientes</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(customers ?? []).map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {customers && customers.length === 0 && (
          <div className="text-center py-8">Nenhum cliente encontrado.</div>
        )}
      </CardContent>
    </Card>
  );
}
