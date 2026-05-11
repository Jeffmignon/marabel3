import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, className = "", padding = "md", onClick }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${paddings[padding]} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
