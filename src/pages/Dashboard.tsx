import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
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
import {
  getLowStockProducts,
  getProducts,
  getCustomers,
  getSales,
} from "@/services/api";

const Dashboard = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [kpis, setKpis] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalLowStock: 0,
    totalSalesValue: 0,
    avgTicket: 0,
    avgStock: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const [productsRes, customersRes, salesRes, lowStockRes] =
        await Promise.all([
          getProducts({ page: 1, pageSize: 1000 }),
          getCustomers(),
          getSales(),
          getLowStockProducts(),
        ]);
      const totalSalesValue = (salesRes || []).reduce(
        (acc, s) => acc + (s.total || s.valor || 0),
        0
      );
      const avgTicket =
        salesRes && salesRes.length > 0 ? totalSalesValue / salesRes.length : 0;
      const avgStock =
        productsRes && productsRes.data && productsRes.data.length > 0
          ? productsRes.data.reduce(
              (acc, p) => acc + (p.currentStock || 0),
              0
            ) / productsRes.data.length
          : 0;
      setKpis({
        totalProducts: productsRes?.count || 0,
        totalCustomers: customersRes?.length || 0,
        totalSales: salesRes?.length || 0,
        totalLowStock: lowStockRes?.length || 0,
        totalSalesValue,
        avgTicket,
        avgStock,
      });
    }
    fetchData();
  }, []);

  // MOCKS para gráficos e listas
  const vendasPorMes = {
    labels: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    datasets: [
      {
        label: "Vendas",
        data: [12, 19, 8, 15, 22, 30, 25, 18, 20, 24, 28, 32],
        backgroundColor: "#2563eb",
      },
    ],
  };
  const categoriasProdutos = {
    labels: [
      "Bebidas",
      "Alimentos",
      "Limpeza",
      "Higiene",
      "Eletrônicos",
      "Papelaria",
      "Outros",
    ],
    datasets: [
      {
        label: "Categorias",
        data: [20, 35, 15, 10, 8, 12, 5],
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
  const ultimasVendas = [
    { id: 1, cliente: "João Silva", valor: 120.5, data: "21/11/2025" },
    { id: 2, cliente: "Maria Souza", valor: 89.9, data: "20/11/2025" },
    { id: 3, cliente: "Carlos Lima", valor: 45.0, data: "19/11/2025" },
    { id: 4, cliente: "Ana Paula", valor: 210.0, data: "18/11/2025" },
    { id: 5, cliente: "Pedro Elias", valor: 320.0, data: "17/11/2025" },
    { id: 6, cliente: "Fernanda Lima", valor: 150.0, data: "16/11/2025" },
  ];
  const destaques = [
    { label: "Produto Mais Vendido", value: "Coca-Cola 2L" },
    { label: "Cliente Mais Ativo", value: "João Silva" },
    { label: "Maior Venda", value: "R$ 500,00" },
    { label: "Categoria em Alta", value: "Alimentos" },
    { label: "Produto com Maior Estoque", value: "Arroz 5kg" },
  ];

  // Produtos mockados para estoque baixo (exemplo visual)
  const produtosEstoqueBaixo = [
    {
      id: "1",
      name: "Coca-Cola 2L",
      current_stock: 3,
      category: "Bebidas",
      price: 8.99,
      description: "Refrigerante",
    },
    {
      id: "2",
      name: "Arroz 5kg",
      current_stock: 2,
      category: "Alimentos",
      price: 22.5,
      description: "Arroz branco tipo 1",
    },
    {
      id: "3",
      name: "Detergente Ypê",
      current_stock: 1,
      category: "Limpeza",
      price: 2.99,
      description: "Detergente neutro",
    },
    {
      id: "4",
      name: "Sabonete Dove",
      current_stock: 4,
      category: "Higiene",
      price: 4.5,
      description: "Sabonete hidratante",
    },
    {
      id: "5",
      name: "Caderno 96 folhas",
      current_stock: 5,
      category: "Papelaria",
      price: 12.0,
      description: "Caderno universitário",
    },
    {
      id: "6",
      name: "Mouse USB",
      current_stock: 2,
      category: "Eletrônicos",
      price: 35.0,
      description: "Mouse óptico",
    },
    {
      id: "7",
      name: "Água Mineral 500ml",
      current_stock: 3,
      category: "Bebidas",
      price: 2.5,
      description: "Água sem gás",
    },
  ];

  return (
    <div className="relative min-h-screen subtle-bg">
      <div className="absolute inset-0 pointer-events-none opacity-25 brand-gradient" />
      <div className="relative flex flex-col gap-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💰</span> Valor Total de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {kpis.totalSalesValue > 0
                  ? `R$ ${kpis.totalSalesValue.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  : "–"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🧾</span> Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {kpis.avgTicket > 0
                  ? `R$ ${kpis.avgTicket.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  : "–"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span> Estoque Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {kpis.avgStock > 0
                  ? kpis.avgStock.toLocaleString("pt-BR", {
                      maximumFractionDigits: 1,
                    })
                  : "–"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Valor: R$ 0,00
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📦</span> Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {kpis.totalProducts > 0 ? kpis.totalProducts : "–"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Itens cadastrados
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>👥</span> Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {kpis.totalCustomers > 0 ? kpis.totalCustomers : "–"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Clientes únicos
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🛒</span> Total de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {kpis.totalSales > 0 ? kpis.totalSales : "–"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Pedidos realizados
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⚠️</span> Estoque Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {kpis.totalLowStock > 0 ? kpis.totalLowStock : "–"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Produtos abaixo do ideal
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Destaques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vendas por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ minHeight: 220 }}>
                <Bar
                  data={vendasPorMes}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ minHeight: 180 }}>
                  <Pie
                    data={categoriasProdutos}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: "bottom" } },
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Destaques</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  {destaques.map((d) => (
                    <li key={d.label}>
                      <b>{d.label}:</b> {d.value}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Últimas vendas e produtos com estoque baixo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-muted-foreground/10">
                {ultimasVendas.map((v) => (
                  <li key={v.id} className="flex justify-between py-2 text-sm">
                    <span>{v.cliente}</span>
                    <span className="text-muted-foreground">{v.data}</span>
                    <span className="font-semibold">
                      R$ {v.valor.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Produtos com Estoque Baixo</CardTitle>
              <CardDescription>
                Veja os produtos que estão com estoque crítico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">
                      Qtd. em Estoque
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosEstoqueBaixo.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() =>
                        setExpanded(expanded === p.id ? null : p.id)
                      }
                    >
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="text-right">
                        {p.current_stock}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
