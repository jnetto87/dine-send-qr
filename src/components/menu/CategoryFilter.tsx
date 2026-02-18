import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
            selected === null
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-muted-foreground shadow-card hover:bg-secondary"
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
              selected === cat.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground shadow-card hover:bg-secondary"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
