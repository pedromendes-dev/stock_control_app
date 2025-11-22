export type ThemeKey =
  | "eletronicos"
  | "escritorio"
  | "supermercado"
  | "petshop"
  | "farmacia"
  | "livraria";

export const THEMES: Record<
  ThemeKey,
  { categories: string[]; productSeeds: string[] }
> = {
  eletronicos: {
    categories: ["Smartphones", "Notebooks", "Acessórios", "Áudio", "Gaming"],
    productSeeds: [
      "Cabo USB-C 1m",
      "Carregador Rápido 20W",
      "Fone Bluetooth Over-Ear",
      "Mouse Gamer RGB",
      "Teclado Mecânico",
      'Notebook 15"',
      'Monitor 27" 144Hz',
      "Hub USB-C 6 em 1",
      "SSD NVMe 1TB",
      "Smartphone 128GB",
    ],
  },
  escritorio: {
    categories: ["Cadernos", "Canetas", "Papéis", "Organização", "Informática"],
    productSeeds: [
      "Caderno Universitário 200 folhas",
      "Caneta Esferográfica Azul",
      "Papel A4 500 folhas",
      "Pasta Suspensa",
      "Grampeador Médio",
      "Mouse Óptico USB",
      "Teclado Office",
      "Bloco Adesivo",
      "Envelope Kraft",
      "Marcador de Texto",
    ],
  },
  supermercado: {
    categories: ["Bebidas", "Mercearia", "Higiene", "Limpeza", "Frios"],
    productSeeds: [
      "Água Mineral 1,5L",
      "Refrigerante 2L",
      "Arroz 5kg",
      "Feijão 1kg",
      "Detergente 500ml",
      "Sabonete em Barra",
      "Leite Integral 1L",
      "Queijo Mussarela 500g",
      "Café 500g",
      "Azeite 500ml",
    ],
  },
  petshop: {
    categories: ["Rações", "Higiene", "Brinquedos", "Acessórios", "Saúde"],
    productSeeds: [
      "Ração Cães Adultos 10kg",
      "Areia Higiênica 4kg",
      "Brinquedo Bola Média",
      "Coleira Ajustável",
      "Shampoo Neutro 500ml",
      "Antipulgas Gotas",
      "Ração Gatos Filhotes 2kg",
      "Arranhador Pequeno",
      "Comedouro Duplo",
      "Petisco Dental",
    ],
  },
  farmacia: {
    categories: [
      "Medicamentos",
      "Vitaminas",
      "Higiene",
      "Dermocosméticos",
      "Primeiros Socorros",
    ],
    productSeeds: [
      "Paracetamol 750mg",
      "Vitamina C 1g",
      "Creme Hidratante Facial",
      "Sabonete Antisséptico",
      "Termômetro Digital",
      "Esparadrapo 2cmx2m",
      "Álcool 70% 500ml",
      "Protetor Solar FPS50",
      "Multivitamínico Adulto",
      "Soro Fisiológico 500ml",
    ],
  },
  livraria: {
    categories: ["Ficção", "Não Ficção", "Infantil", "Didáticos", "HQ e Mangá"],
    productSeeds: [
      "Romance Best-seller",
      "Livro de História Universal",
      "Livro Ilustrado Infantil",
      "Gramática Língua Portuguesa",
      "Quadrinho Super-herói Volume 1",
      "Mangá Série Volume 3",
      "Atlas Geográfico Escolar",
      "Biografia Personalidade Famosa",
      "Livro de Receitas Caseiras",
      "Manual de Programação Web",
    ],
  },
};

export function resolveThemeKey(value: unknown): ThemeKey {
  const v = String(value || "")
    .toLowerCase()
    .trim();
  if (
    v === "escritorio" ||
    v === "supermercado" ||
    v === "petshop" ||
    v === "farmacia" ||
    v === "livraria"
  )
    return v as ThemeKey;
  return "eletronicos";
}
