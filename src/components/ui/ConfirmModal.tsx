"use client";

import { type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  warning?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  warning,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${variant === "danger" ? "bg-red-50" : "bg-navy-50"}`}>
            <AlertTriangle size={22} className={variant === "danger" ? "text-red-500" : "text-navy"} />
          </div>
          <h3 id="confirm-title" className="text-base font-medium text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 mb-1">{description}</p>
          {warning && <p className="text-xs text-red-500 mb-4">{warning}</p>}
          {!warning && <div className="mb-4" />}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 h-10 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 h-10 text-sm font-medium text-white rounded-lg transition-colors ${
                variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-navy hover:bg-navy-light"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
