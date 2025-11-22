export interface ProductProps {
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
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    // regras simples de domínio (ex: minStock <= maxStock)
    if (props.minStock > props.maxStock) {
      throw new Error("minStock não pode ser maior que maxStock");
    }
    if (props.currentStock < 0) {
      throw new Error("currentStock não pode ser negativo");
    }
    this.props = props;
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get sku() {
    return this.props.sku;
  }
  get categoryId() {
    return this.props.categoryId;
  }
  get price() {
    return this.props.price;
  }
  get cost() {
    return this.props.cost;
  }
  get currentStock() {
    return this.props.currentStock;
  }
  get minStock() {
    return this.props.minStock;
  }
  get maxStock() {
    return this.props.maxStock;
  }

  updateStock(newStock: number) {
    if (newStock < 0) throw new Error("Estoque não pode ser negativo");
    this.props.currentStock = newStock;
  }
}
