export type ThemeKey = "verde" | "azul" | "roxo" | "laranja" | "rosa";

export interface Establishment {
  name: string;
  description: string;
  logo: string;
  whatsapp: string;
  isOpen: boolean;
  slug: string;

  prepTimeMinutes?: number;

  // ✅ novo
  theme?: ThemeKey;
}



export interface Category {
  id: string;
  name: string;
  order: number;
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  active: boolean;
  order?: number; // ✅ novo (opcional)
};

export interface CartItem {
  product: Product;
  quantity: number;
}

export const MAX_PRODUCTS = 15;
