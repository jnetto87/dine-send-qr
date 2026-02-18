import { CartItem, Establishment } from "@/lib/types";
import { Minus, Plus, Trash2, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  items: CartItem[];
  establishment: Establishment;
  customerName: string;
  tableNumber: string;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onClose: () => void;
}

export default function OrderSummary({ items, establishment, customerName, tableNumber, onUpdateQty, onRemove, onClose }: Props) {
  const [notes, setNotes] = useState("");
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const sendToWhatsApp = () => {
    if (!customerName.trim()) {
      toast.error("Informe seu nome para enviar o pedido");
      return;
    }
    if (!tableNumber.trim()) {
      toast.error("Informe o número da mesa");
      return;
    }
    if (items.length === 0) {
      toast.error("Adicione itens ao carrinho");
      return;
    }

    const itemsText = items
      .map((i) => `${i.quantity}x ${i.product.name}`)
      .join("\n");

    let message = `Olá! Me chamo *${customerName.trim()}*. Pode confirmar meu pedido?\n\n`;
    message += `*MESA:* ${tableNumber.trim()}\n\n`;
    message += `*ITENS:*\n${itemsText}\n\n`;
    message += `*TOTAL:* R$ ${total.toFixed(2).replace(".", ",")}\n`;
    message += `*TIPO:* Consumo no local\n`;
    if (notes.trim()) {
      message += `\n*OBS:* ${notes.trim()}`;
    }

    const phone = establishment.whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto flex max-h-[85vh] flex-col rounded-t-3xl bg-card shadow-lg animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-foreground">Seu Pedido</h2>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                <p className="text-sm text-primary font-semibold">
                  R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <div className="flex items-center rounded-full bg-secondary">
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.product.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          <div className="mt-3">
            <label className="text-xs font-medium text-muted-foreground">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: sem cebola, ponto da carne..."
              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="border-t border-border px-5 py-4 space-y-3">
          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Total</span>
            <span>R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>
          <button
            onClick={sendToWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" />
            Enviar pedido no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
