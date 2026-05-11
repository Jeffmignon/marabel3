"use client";

import { Check, X, RefreshCw } from "lucide-react";

interface ToastProps {
  message: string;
  variant?: "success" | "warning" | "info";
  onDismiss?: () => void;
}

const styles = {
  success: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: <Check size={16} className="text-emerald-600 shrink-0" /> },
  warning: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: <RefreshCw size={14} className="text-amber-600 shrink-0" /> },
  info: { bg: "bg-navy-50 border-navy/20", text: "text-navy", icon: <Check size={16} className="text-navy shrink-0" /> },
};

export function Toast({ message, variant = "success", onDismiss }: ToastProps) {
  const s = styles[variant];
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg ${s.bg}`} role="status" aria-live="polite">
      {s.icon}
      <p className={`text-sm flex-1 font-medium ${s.text}`}>{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className={`${s.text} opacity-40 hover:opacity-70`} aria-label="Dismiss">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
