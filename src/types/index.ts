export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  price: number;
  cost: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'ENTRADA' | 'SAÍDA';
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}
