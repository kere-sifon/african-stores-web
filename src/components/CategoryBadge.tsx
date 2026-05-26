import { Badge } from "@/components/ui/badge";
import { getCategoryColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-normal border-0",
        getCategoryColor(category),
        className
      )}
    >
      {category}
    </Badge>
  );
}
