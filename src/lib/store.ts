import { Establishment, Category, Product, CartItem } from "./types";

const KEYS = {
  establishment: "menu_establishment",
  categories: "menu_categories",
  products: "menu_products",
  cart: "menu_cart",
  adminAuth: "menu_admin_auth",
};

// Default demo data
const defaultEstablishment: Establishment = {
  name: "Burger House",
  description: "Os melhores hambúrgueres artesanais da cidade",
  logo: "",
  whatsapp: "5511999999999",
  isOpen: true,
  slug: "burger-house",
};

const defaultCategories: Category[] = [
  { id: "cat1", name: "Hambúrgueres", order: 0 },
  { id: "cat2", name: "Bebidas", order: 1 },
  { id: "cat3", name: "Combos", order: 2 },
  { id: "cat4", name: "Sobremesas", order: 3 },
];

const defaultProducts: Product[] = [
  { id: "p1", name: "Classic Burger", description: "Pão, carne 150g, queijo, alface e tomate", price: 28.90, image: "", categoryId: "cat1", active: true },
  { id: "p2", name: "Bacon Burger", description: "Pão, carne 150g, bacon crocante e cheddar", price: 34.90, image: "", categoryId: "cat1", active: true },
  { id: "p3", name: "Smash Burger", description: "Pão brioche, duplo smash com queijo", price: 32.90, image: "", categoryId: "cat1", active: true },
  { id: "p4", name: "Coca-Cola 350ml", description: "Lata gelada", price: 7.00, image: "", categoryId: "cat2", active: true },
  { id: "p5", name: "Suco Natural", description: "Laranja, limão ou maracujá", price: 10.00, image: "", categoryId: "cat2", active: true },
  { id: "p6", name: "Água Mineral", description: "500ml com ou sem gás", price: 5.00, image: "", categoryId: "cat2", active: true },
  { id: "p7", name: "Combo Classic", description: "Classic Burger + Batata + Refrigerante", price: 42.90, image: "", categoryId: "cat3", active: true },
  { id: "p8", name: "Combo Bacon", description: "Bacon Burger + Batata + Refrigerante", price: 48.90, image: "", categoryId: "cat3", active: true },
  { id: "p9", name: "Brownie", description: "Com sorvete de baunilha", price: 18.90, image: "", categoryId: "cat4", active: true },
];

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getEstablishment(): Establishment {
  return get(KEYS.establishment, defaultEstablishment);
}
export function setEstablishment(e: Establishment) {
  set(KEYS.establishment, e);
}

export function getCategories(): Category[] {
  return get(KEYS.categories, defaultCategories);
}
export function setCategories(c: Category[]) {
  set(KEYS.categories, c);
}

export function getProducts(): Product[] {
  return get(KEYS.products, defaultProducts);
}
export function setProducts(p: Product[]) {
  set(KEYS.products, p);
}

export function getCart(): CartItem[] {
  return get(KEYS.cart, []);
}
export function setCart(c: CartItem[]) {
  set(KEYS.cart, c);
}

export function isAdminAuthenticated(): boolean {
  return get(KEYS.adminAuth, false);
}
export function setAdminAuth(v: boolean) {
  set(KEYS.adminAuth, v);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}
