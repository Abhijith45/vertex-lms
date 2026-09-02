import React from "react";
import { LucideIcon } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   BUTTON
   Variants: primary | secondary | tertiary | text
   Sizes:    default (h-11) | sm (h-9)
   ────────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";
type ButtonSize = "default" | "sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-primary-500 text-white",
    "hover:bg-[#E8660F]",
    "disabled:bg-primary-300 disabled:cursor-not-allowed",
  ].join(" "),
  secondary: [
    "border border-primary-500 text-primary-500 bg-transparent",
    "hover:bg-primary-100",
    "disabled:border-primary-300 disabled:text-primary-300 disabled:cursor-not-allowed",
  ].join(" "),
  tertiary: [
    "text-neutral-700 bg-transparent",
    "hover:bg-neutral-100",
    "disabled:text-neutral-300 disabled:cursor-not-allowed",
  ].join(" "),
  text: [
    "text-primary-500 bg-transparent",
    "hover:text-[#E8660F]",
    "disabled:text-primary-300 disabled:cursor-not-allowed",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "default",
  icon: Icon,
  iconPosition = "right",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-colors duration-150 cursor-pointer",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="h-4 w-4" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="h-4 w-4" />}
    </button>
  );
}
