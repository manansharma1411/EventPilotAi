"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; message?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    ({
      type = "info",
      title,
      message,
    }: {
      type?: ToastType;
      title: string;
      message?: string;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-dropdown border transition-all animate-in slide-in-from-bottom-2",
              t.type === "success" && "bg-white border-emerald-200 text-slate-800",
              t.type === "error" && "bg-white border-rose-200 text-slate-800",
              t.type === "info" && "bg-white border-brand-200 text-slate-800"
            )}
          >
            {t.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            {t.type === "error" && (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            {t.type === "info" && (
              <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy-900">{t.title}</p>
              {t.message && (
                <p className="text-xs text-slate-600 mt-0.5">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
