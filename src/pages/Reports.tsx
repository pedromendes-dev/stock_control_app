import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProducts, getCategories, getStockMovements } from "@/services/api";
import type { Product, StockMovement } from "@/types";
import type { TopMoved } from "@/features/reports/services/reportMetrics";
import {
  filterMovementsByDate,
  computeSalesCostProfit,
  computeSalesByCategory,
  computeStockValueComposition,
  computeTopMovedProducts,
} from "@/features/reports/services/reportMetrics";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [date] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: prodData }, , movs] = await Promise.all([
          getProducts({ page: 1, pageSize: 200 }),
          getCategories(),
          getStockMovements(),
        ]);
        setProducts(prodData as Product[]);
        setMovements(movs as StockMovement[]);
      } catch (e) {
        console.error("Erro ao carregar relatórios", e);
      }
    }
    load();
  }, []);

  // Movimentações filtradas pelo intervalo
  const filteredMovements = filterMovementsByDate(movements, date);
  // KPIs principais
  const { grossProfit } = computeSalesCostProfit(filteredMovements, products);
  const totalStockValue = products.reduce(
    (acc, p) => acc + (p.cost ?? 0) * (p.currentStock ?? 0),
    0
  );
  // const salesCount = filteredMovements.filter((m) => m.type === "SAÍDA").length;
  // const avgTicket = salesCount > 0 ? totalSales / salesCount : 0;
  const topMovedProducts = computeTopMovedProducts(
    filteredMovements,
    products,
    5
  );

  // MOCK: Dados fictícios para visualização se não houver dados reais
  const mockSalesByCategory = [
    { name: "Bebidas", total: 1200 },
    { name: "Alimentos", total: 900 },
    { name: "Limpeza", total: 500 },
    { name: "Higiene", total: 300 },
  ];
  const mockStockValueComposition = [
    { name: "Bebidas", value: 1500 },
    { name: "Alimentos", value: 800 },
    { name: "Limpeza", value: 400 },
    { name: "Higiene", value: 200 },
  ];

  const salesByCategory = computeSalesByCategory(
    filteredMovements,
    products,
    []
  );
  const barData = {
    labels: (salesByCategory.length > 0
      ? salesByCategory
      : mockSalesByCategory
    ).map((c) => c.name),
    datasets: [
      {
        label: "Vendas por Categoria (R$)",
        data: (salesByCategory.length > 0
          ? salesByCategory
          : mockSalesByCategory
        ).map((c) => c.total),
        backgroundColor: "#2563eb",
      },
    ],
  };

  const stockValueComposition = computeStockValueComposition(products, []);
  const pieData = {
    labels: (stockValueComposition.length > 0
      ? stockValueComposition
      : mockStockValueComposition
    ).map((s) => s.name),
    datasets: [
      {
        label: "Composição do Estoque",
        data: (stockValueComposition.length > 0
          ? stockValueComposition
          : mockStockValueComposition
        ).map((s) => s.value),
        backgroundColor: [
          "#2563eb",
          "#22d3ee",
          "#f59e42",
          "#f43f5e",
          "#a3e635",
          "#a78bfa",
          "#64748b",
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Relatórios e Análises
        </h1>
        <p className="text-muted-foreground mb-4">
          Acompanhe os principais indicadores do seu negócio.
        </p>
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total de Vendas</CardTitle>
              <CardDescription>Valor bruto vendido no período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ 340,00</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lucro Bruto</CardTitle>
              <CardDescription>
                Receita - Custo dos produtos vendidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R${" "}
                {Math.abs(grossProfit).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ticket Médio</CardTitle>
              <CardDescription>Valor médio por venda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ 800,00</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Valor em Estoque</CardTitle>
              <CardDescription>
                Valor total dos produtos em estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R${" "}
                {totalStockValue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabela de produtos mais movimentados */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Movimentados</CardTitle>
            <CardDescription>
              Top 5 produtos com maior movimentação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Entradas</TableHead>
                  <TableHead className="text-center">Saídas</TableHead>
                  <TableHead className="text-right">
                    Total Movimentado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topMovedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground text-sm"
                    >
                      Nenhum dado disponível.
                    </TableCell>
                  </TableRow>
                ) : (
                  topMovedProducts.map((p: TopMoved) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-center text-green-600">
                        {p.entries}
                      </TableCell>
                      <TableCell className="text-center text-red-600">
                        {p.exits}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {p.total}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
            <CardDescription>
              Distribuição do valor vendido por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ minHeight: 220 }}>
              {barData.datasets[0].data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                    <path
                      fill="#cbd5e1"
                      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                    />
                  </svg>
                  <span>
                    Nenhum dado para exibir.
                    <br />
                    Cadastre vendas para visualizar o gráfico.
                  </span>
                </div>
              ) : (
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false,
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Composição do Estoque</CardTitle>
            <CardDescription>Valor do estoque por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ minHeight: 220 }}>
              {pieData.datasets[0].data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                    <path
                      fill="#cbd5e1"
                      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                    />
                  </svg>
                  <span>
                    Nenhum dado para exibir.
                    <br />
                    Cadastre produtos para visualizar o gráfico.
                  </span>
                </div>
              ) : (
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                    maintainAspectRatio: false,
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
