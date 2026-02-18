export interface Establishment {
  name: string;
  description: string;
  logo: string;
  whatsapp: string;
  isOpen: boolean;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const MAX_PRODUCTS = 15;
