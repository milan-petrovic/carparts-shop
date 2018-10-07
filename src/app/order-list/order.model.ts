import { Product } from '../products/product.model';

export interface Order {
  id: string;
  product: Product;
}
