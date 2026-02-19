import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ESTABLISHMENT_UPDATED_EVENT,
  PRODUCTS_UPDATED_EVENT,
  CATEGORIES_UPDATED_EVENT,
  getEstablishment,
  getCategories,
  getProducts,
  getCart,
  setCart,
} from "@/lib/store";

import { CartItem, Product } from "@/lib/types";
import MenuHeader from "@/components/menu/MenuHeader";
import CategoryFilter from "@/components/menu/CategoryFilter";
import ProductCard from "@/components/menu/ProductCard";
import CartBar from "@/components/menu/CartBar";
import OrderSummary from "@/components/menu/OrderSummary";
import { toast } from "sonner";

type OrderType = "local" | "retirada";

export default function Menu() {
  // ✅ Mantém sincronizado (Admin -> Menu)
  const [establishment, setEstablishmentState] = useState(getEstablishment);
  const [categories, setCategoriesState] = useState(getCategories);
  const [products, setProductsState] = useState(() => getProducts().filter((p) => p.active));

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(getCart);
  const [showSummary, setShowSummary] = useState(false);

  const [orderType, setOrderType] = useState<OrderType>("local");
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  // ✅ sempre use o boolean “real”
  const isOpen = establishment.isOpen === true;

  // ✅ Atualiza tudo quando voltar pro menu / trocar de aba / storage / evento
  useEffect(() => {
    const syncAll = () => {
      setEstablishmentState(getEstablishment());
      setCategoriesState(getCategories());
      setProductsState(getProducts().filter((p) => p.active));
    };

    syncAll();
    window.addEventListener("storage", syncAll);
    window.addEventListener("focus", syncAll);
    window.addEventListener(ESTABLISHMENT_UPDATED_EVENT, syncAll);
    window.addEventListener(PRODUCTS_UPDATED_EVENT, syncAll);
    window.addEventListener(CATEGORIES_UPDATED_EVENT, syncAll);

    return () => {
      window.removeEventListener("storage", syncAll);
      window.removeEventListener("focus", syncAll);
      window.removeEventListener(ESTABLISHMENT_UPDATED_EVENT, syncAll);
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, syncAll);
      window.removeEventListener(CATEGORIES_UPDATED_EVENT, syncAll);
    };
  }, []);

  // Persist cart
  useEffect(() => {
    setCart(cartItems);
  }, [cartItems]);

  // Se trocar para "retirada", mesa não faz sentido
  useEffect(() => {
    if (orderType === "retirada") setTableNumber("");
  }, [orderType]);

  const filteredProducts = useMemo(() => {
    return selectedCategory
      ? products.filter((p) => p.categoryId === selectedCategory)
      : products;
  }, [products, selectedCategory]);

  // ✅ Bloqueia adicionar ao carrinho se estiver fechado
  const addToCart = useCallback(
    (product: Product, qty: number) => {
      if (!isOpen) {
        toast.error("A loja está fechada e não está aceitando pedidos.");
        return;
      }

      setCartItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + qty }
              : i
          );
        }
        return [...prev, { product, quantity: qty }];
      });

      toast.success(`${product.name} adicionado!`, { duration: 1500 });
    },
    [isOpen]
  );

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: qty } : i
        )
      );
    }
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // ✅ Bloqueia abrir resumo se estiver fechado + validações
  const openSummary = () => {
    if (!isOpen) {
      toast.error("A loja está fechada e não está aceitando pedidos.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Seu pedido está vazio 🙂", { duration: 1800 });
      return;
    }

    const nomeOk = customerName.trim().length > 0;
    const mesaOk =
      orderType === "local" ? Number(tableNumber) >= 1 && Number.isFinite(Number(tableNumber)) : true;


    if (!nomeOk) {
      toast.error("Informe seu nome 🙂", { duration: 2000 });
      return;
    }

    if (!mesaOk) {
      toast.error("Informe o número da mesa 🙂", { duration: 2000 });
      return;
    }

    setShowSummary(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <MenuHeader establishment={establishment} />

      {!isOpen && (
        <div className="px-4 pt-3">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            <span className="font-semibold">Fechado no momento.</span>{" "}
            Você pode ver o cardápio, mas não dá pra enviar pedidos agora.
          </div>
        </div>
      )}

      {/* Customer info */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOrderType("local")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium border transition ${orderType === "local"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-input"
              }`}
          >
            Consumir no local
          </button>

          <button
            type="button"
            onClick={() => setOrderType("retirada")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium border transition ${orderType === "retirada"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-input"
              }`}
          >
            Retirar pra viagem
          </button>
        </div>

        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Seu nome *"
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {orderType === "local" && (
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={tableNumber}
            onChange={(e) => {
              // mantém só número e impede negativo/zero
              const raw = e.target.value;
              const n = Number(raw);
              if (!raw) return setTableNumber("");       // permite limpar
              if (!Number.isFinite(n)) return;           // ignora lixo
              if (n < 1) return setTableNumber("1");     // trava no mínimo
              setTableNumber(String(Math.floor(n)));     // sem decimal
            }}
            onBlur={() => {
              // se sair do campo vazio/0/negativo, ajusta para 1
              const n = Number(tableNumber);
              if (!tableNumber || !Number.isFinite(n) || n < 1) setTableNumber("1");
            }}
            placeholder="Número da mesa *"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}

      </div>

      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="px-4 space-y-3 mt-1">
        {filteredProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhum produto nesta categoria
          </p>
        ) : (
          filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))
        )}
      </div>

      <CartBar items={cartItems} onOpen={openSummary} />

      {showSummary && (
        <OrderSummary
          items={cartItems}
          establishment={establishment}
          customerName={customerName}
          tableNumber={tableNumber}
          orderType={orderType}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}
