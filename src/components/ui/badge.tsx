import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "indigo"
    | "success"
    | "warning"
    | "rose"
    | "neutral"
    | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full transition-colors select-none";

  const variants = {
    default: "bg-slate-100 text-slate-800 border border-slate-200",
    indigo: "bg-brand-50 text-brand-700 border border-brand-200/80",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
    rose: "bg-rose-50 text-rose-800 border border-rose-200/80",
    neutral: "bg-slate-900 text-white border border-slate-800",
    outline: "bg-transparent text-slate-700 border border-slate-300",
  };

  const sizes = {
    sm: "text-[11px] px-2.5 py-0.5 gap-1",
    md: "text-xs px-3 py-1 gap-1.5",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
