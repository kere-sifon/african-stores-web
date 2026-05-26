import { IStore } from "@/lib/models/store";
import { StoreCard } from "@/components/StoreCard";
import { cn } from "@/lib/utils";

interface StoreGridProps {
  stores: IStore[];
  className?: string;
}

export function StoreGrid({ stores, className }: StoreGridProps) {
  if (stores.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}
