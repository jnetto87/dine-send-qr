import { useState, useEffect, useCallback } from "react";
import { CartItem, Product } from "@/lib/types";
import { getEstablishment, getCategories, getProducts, getCart, setCart } from "@/lib/store";
import MenuHeader from "@/components/menu/MenuHeader";
import CategoryFilter from "@/components/menu/CategoryFilter";
import ProductCard from "@/components/menu/ProductCard";
import CartBar from "@/components/menu/CartBar";
import OrderSummary from "@/components/menu/OrderSummary";
import { toast } from "sonner";

export default function Menu() {
  const [establishment] = useState(getEstablishment);
  const [categories] = useState(getCategories);
  const [products] = useState(() => getProducts().filter((p) => p.active));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(getCart);
  const [showSummary, setShowSummary] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    setCart(cartItems);
  }, [cartItems]);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const addToCart = useCallback((product: Product, qty: number) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    toast.success(`${product.name} adicionado!`, { duration: 1500 });
  }, []);

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <MenuHeader establishment={establishment} />

      {/* Customer info */}
      <div className="px-4 py-3 space-y-2">
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Seu nome *"
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="Número da mesa *"
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="px-4 space-y-3 mt-1">
        {filteredProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Nenhum produto nesta categoria</p>
        ) : (
          filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))
        )}
      </div>

      <CartBar items={cartItems} onOpen={() => setShowSummary(true)} />

      {showSummary && (
        <OrderSummary
          items={cartItems}
          establishment={establishment}
          customerName={customerName}
          tableNumber={tableNumber}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}
