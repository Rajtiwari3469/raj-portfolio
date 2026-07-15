"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "primary" | "accent" | "gold" | "none";
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
    none: "",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass rounded-2xl p-6",
        hover && "transition-all duration-300 hover:scale-[1.02]",
        hover && glowStyles[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
