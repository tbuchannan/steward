import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const Input = ({ className, type, ...props }: ComponentProps<"input">) => (
  <input
    className={cn(
      "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className,
    )}
    data-slot="input"
    type={type}
    {...props}
  />
);

export { Input };
