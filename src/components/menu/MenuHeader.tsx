import { Establishment } from "@/lib/types";
import { Store } from "lucide-react";

interface Props {
  establishment: Establishment;
}

export default function MenuHeader({ establishment }: Props) {
  return (
    <div className="bg-card px-4 pt-6 pb-4 text-center shadow-card">
      <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary">
        {establishment.logo ? (
          <img src={establishment.logo} alt={establishment.name} className="h-full w-full object-cover" />
        ) : (
          <Store className="h-10 w-10 text-primary" />
        )}
      </div>
      <h1 className="text-xl font-bold text-foreground">{establishment.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{establishment.description}</p>
      {!establishment.isOpen && (
        <div className="mt-2 inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
          Fechado no momento
        </div>
      )}
    </div>
  );
}
