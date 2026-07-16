"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "primary" | "accent" | "gold" | "purple" | "none";
  onClick?: () => void;
}

export default function GlassPanel({
  children,
  className,
  hover = false,
  glow = "none",
  onClick,
}: GlassPanelProps) {
  const glowStyles = {
    primary: "hover:glow-primary",
    accent: "hover:glow-accent",
    gold: "hover:glow-gold",
    purple: "hover:glow-purple",
    none: "",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass rounded-2xl p-6 relative overflow-hidden",
        hover && "transition-all duration-500 hover:scale-[1.02] hover:border-primary/20",
        hover && glowStyles[glow],
        className
      )}
    >
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02]" />
      {children}
    </div>
  );
}
