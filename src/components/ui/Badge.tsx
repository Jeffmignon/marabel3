import { type ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "error" | "info";

const variants: Record<Variant, string> = {
  default: "bg-gray-100 text-gray-600",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  info: "bg-navy-50 text-navy",
};

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: Variant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${variants[variant]}`}>
      {children}
    </span>
  );
}
