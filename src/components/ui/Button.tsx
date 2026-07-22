import * as React from "react";
import Link from "next/link";

type BaseButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
};

type AnchorProps = BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

type NativeButtonProps = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

export type ButtonProps = AnchorProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    children,
    className = "",
    href,
    ...rest
  } = props;

  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

  const variants = {
    primary:
      "bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-500/10 rounded-xl",
    secondary:
      "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl",
    ghost: "text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs font-semibold gap-1.5",
    md: "px-4.5 py-2 text-sm font-semibold gap-2",
    lg: "px-6 py-3 text-base font-semibold gap-2.5",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    const { target, rel, title, onClick, ...anchorRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        title={title}
        onClick={onClick}
        className={combinedClassName}
        {...anchorRest}
      >
        {children}
      </Link>
    );
  }

  const { type, ...buttonRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      type={type ?? "button"}
      className={combinedClassName}
      {...buttonRest}
    >
      {children}
    </button>
  );
}