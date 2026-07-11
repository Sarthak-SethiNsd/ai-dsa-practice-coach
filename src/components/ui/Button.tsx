import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";
  
  const variants = {
    primary: "bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-500/10 rounded-xl",
    secondary: "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl",
    ghost: "text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs font-semibold gap-1.5",
    md: "px-4.5 py-2 text-sm font-semibold gap-2",
    lg: "px-6 py-3 text-base font-semibold gap-2.5",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
