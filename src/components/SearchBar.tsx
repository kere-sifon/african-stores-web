"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  /** Navigate to /stores with query on submit (homepage). If false, calls onSearch. */
  navigateOnSubmit?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Search stores, products, cities…",
  className,
  navigateOnSubmit = true,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const onSearchRef = useRef(onSearch);
  const skipDebounceRef = useRef(true);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    setValue(defaultValue);
    skipDebounceRef.current = true;
  }, [defaultValue]);

  const submit = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (navigateOnSubmit) {
        const params = new URLSearchParams();
        if (trimmed) params.set("q", trimmed);
        router.push(`/stores${params.toString() ? `?${params}` : ""}`);
        return;
      }
      onSearch?.(trimmed);
    },
    [navigateOnSubmit, onSearch, router]
  );

  useEffect(() => {
    if (navigateOnSubmit || !onSearchRef.current) return;
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onSearchRef.current?.(value.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [value, navigateOnSubmit]);

  return (
    <form
      className={cn("relative w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
    >
      <Search
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-12 pl-10 pr-4 text-base bg-card-warm border-border-warm focus-visible:ring-accent"
        aria-label="Search stores"
      />
    </form>
  );
}
