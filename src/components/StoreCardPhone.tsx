"use client";

import { Phone } from "lucide-react";
import { formatPhone } from "@/lib/utils";

interface StoreCardPhoneProps {
  phone: string;
}

export function StoreCardPhone({ phone }: StoreCardPhoneProps) {
  const formatted = formatPhone(phone);
  const telHref = `tel:${phone.replace(/\s/g, "")}`;

  return (
    <span
      role="link"
      tabIndex={0}
      className="inline-flex items-center gap-1.5 text-ink/90 hover:text-accent cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = telHref;
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = telHref;
        }
      }}
    >
      <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {formatted}
    </span>
  );
}
