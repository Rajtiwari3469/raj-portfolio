"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground/70 tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08]",
            "text-foreground placeholder-foreground/30",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
            "focus:shadow-[0_0_20px_rgba(0,212,255,0.1)]",
            "transition-all duration-300",
            error && "border-red-500/50 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground/70 tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08]",
            "text-foreground placeholder-foreground/30",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
            "focus:shadow-[0_0_20px_rgba(0,212,255,0.1)]",
            "transition-all duration-300 resize-none",
            error && "border-red-500/50 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
