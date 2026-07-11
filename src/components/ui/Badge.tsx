import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "neutral";
  children: React.ReactNode;
}

export function Badge({
  variant = "primary",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border";

  const variants = {
    primary: "bg-sky-50 text-sky-700 border-sky-200/60",
    secondary: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    warning: "bg-amber-50 text-amber-700 border-amber-200/60",
    neutral: "bg-slate-50 text-slate-600 border-slate-200/60",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
