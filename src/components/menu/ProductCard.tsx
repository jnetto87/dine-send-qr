import { Product } from "@/lib/types";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { useState } from "react";

interface Props {
  product: Product;
  onAdd: (product: Product, qty: number) => void;
}

export default function ProductCard({ product, onAdd }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQty(1);
    }, 1200);
  };

  return (
    <div className="flex gap-3 rounded-xl bg-card p-3 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-foreground text-sm leading-tight">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-primary">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center rounded-full bg-secondary">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-medium text-foreground">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={added}
              className={`flex h-8 items-center gap-1 rounded-full px-3 text-xs font-medium transition-all ${
                added
                  ? "bg-success text-success-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
              }`}
            >
              {added ? "✓ Adicionado" : "Adicionar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
