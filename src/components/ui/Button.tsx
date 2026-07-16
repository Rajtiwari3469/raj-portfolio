"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", glow = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl relative overflow-hidden";

    const variants = {
      primary: "bg-gradient-to-r from-primary to-accent text-[#050510] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:scale-[1.02] font-semibold",
      secondary: "bg-gradient-to-r from-secondary to-neon-purple text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] font-semibold",
      ghost: "bg-transparent text-foreground/70 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20",
      outline: "border border-glass-border bg-transparent text-foreground/80 hover:border-primary/40 hover:text-primary hover:bg-primary/5",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glow && "animate-pulse-glow",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
