import { Establishment, Category, Product, CartItem } from "./types";

const KEYS = {
  establishment: "menu_establishment",
  categories: "menu_categories",
  products: "menu_products",
  cart: "menu_cart",
  adminAuth: "menu_admin_auth",
};

// ✅ evento custom pra sincronizar na MESMA aba (Admin -> Menu)
const EVENTS = {
  establishmentUpdated: "menu:establishment-updated",
  productsUpdated: "menu:products-updated",
  categoriesUpdated: "menu:categories-updated",
};

// Default demo data
const defaultEstablishment: Establishment = {
  name: "Burger House",
  description: "Os melhores hambúrgueres artesanais da cidade",
  logo: "",
  whatsapp: "5511999999999",
  isOpen: true,
  slug: "burger-house",
  prepTimeMinutes: 25,
  theme: "verde",
};

const defaultCategories: Category[] = [
  { id: "cat1", name: "Hambúrgueres", order: 0 },
  { id: "cat2", name: "Bebidas", order: 1 },
  { id: "cat3", name: "Combos", order: 2 },
  { id: "cat4", name: "Sobremesas", order: 3 },
];

const defaultProducts: Product[] = [
  { id: "p1", name: "Classic Burger", description: "Pão, carne 150g, queijo, alface e tomate", price: 28.9, image: "", categoryId: "cat1", active: true },
  { id: "p2", name: "Bacon Burger", description: "Pão, carne 150g, bacon crocante e cheddar", price: 34.9, image: "", categoryId: "cat1", active: true },
  { id: "p3", name: "Smash Burger", description: "Pão brioche, duplo smash com queijo", price: 32.9, image: "", categoryId: "cat1", active: true },
  { id: "p4", name: "Coca-Cola 350ml", description: "Lata gelada", price: 7.0, image: "", categoryId: "cat2", active: true },
  { id: "p5", name: "Suco Natural", description: "Laranja, limão ou maracujá", price: 10.0, image: "", categoryId: "cat2", active: true },
  { id: "p6", name: "Água Mineral", description: "500ml com ou sem gás", price: 5.0, image: "", categoryId: "cat2", active: true },
  { id: "p7", name: "Combo Classic", description: "Classic Burger + Batata + Refrigerante", price: 42.9, image: "", categoryId: "cat3", active: true },
  { id: "p8", name: "Combo Bacon", description: "Bacon Burger + Batata + Refrigerante", price: 48.9, image: "", categoryId: "cat3", active: true },
  { id: "p9", name: "Brownie", description: "Com sorvete de baunilha", price: 18.9, image: "", categoryId: "cat4", active: true },
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

// ✅ helper forte: corrige boolean e number vindos do localStorage
function toBool(v: any, fallback: boolean) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  if (typeof v === "number") {
    if (v === 1) return true;
    if (v === 0) return false;
  }
  return fallback;
}

function toNumber(v: any, fallback: number) {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function getEstablishment(): Establishment {
  const raw = get<any>(KEYS.establishment, defaultEstablishment);

  const merged: Establishment = {
    ...defaultEstablishment,
    ...raw,
    isOpen: toBool(raw?.isOpen, defaultEstablishment.isOpen), // ✅ AQUI fecha o bug
    prepTimeMinutes: toNumber(raw?.prepTimeMinutes, defaultEstablishment.prepTimeMinutes),
    theme: typeof raw?.theme === "string" ? raw.theme : defaultEstablishment.theme,
  };

  return merged;
}

export function setEstablishment(e: Establishment) {
  // ✅ garante que salvamos boolean e número “limpos”
  const normalized: Establishment = {
    ...e,
    isOpen: toBool((e as any)?.isOpen, true),
    prepTimeMinutes: toNumber((e as any)?.prepTimeMinutes, defaultEstablishment.prepTimeMinutes),
    theme: typeof (e as any)?.theme === "string" ? (e as any).theme : defaultEstablishment.theme,
  };

  set(KEYS.establishment, normalized);

  // ✅ avisa na mesma aba (Menu escuta isso)
  window.dispatchEvent(new Event(EVENTS.establishmentUpdated));
}

export function getCategories(): Category[] {
  return get(KEYS.categories, defaultCategories);
}

export function setCategories(c: Category[]) {
  set(KEYS.categories, c);
  window.dispatchEvent(new Event(EVENTS.categoriesUpdated));
}

export function getProducts(): Product[] {
  return get(KEYS.products, defaultProducts);
}

export function setProducts(p: Product[]) {
  set(KEYS.products, p);
  window.dispatchEvent(new Event(EVENTS.productsUpdated));
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

// ✅ exports de eventos (Menu pode escutar)
export const ESTABLISHMENT_UPDATED_EVENT = EVENTS.establishmentUpdated;
export const PRODUCTS_UPDATED_EVENT = EVENTS.productsUpdated;
export const CATEGORIES_UPDATED_EVENT = EVENTS.categoriesUpdated;
