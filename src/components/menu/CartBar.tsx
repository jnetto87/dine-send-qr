import { CartItem } from "@/lib/types";
import { ShoppingCart } from "lucide-react";

interface Props {
  items: CartItem[];
  onOpen: () => void;
}

export default function CartBar({ items, onOpen }: Props) {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <button
      onClick={onOpen}
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-float transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-card text-[10px] font-bold text-primary">
            {totalItems}
          </span>
        </div>
        <span className="text-sm font-medium">Ver carrinho</span>
      </div>
      <span className="text-base font-bold">
        R$ {totalPrice.toFixed(2).replace(".", ",")}
      </span>
    </button>
  );
}
