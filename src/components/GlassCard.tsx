import { ReactNode } from "react";

type AccentColor = "blush" | "lavender" | "mint" | "champagne" | "sky" | "none";

interface GlassCardProps {
  children: ReactNode;
  accent?: AccentColor;
  className?: string;
  animDelay?: number;
}

const GLOW_CLASS: Record<AccentColor, string> = {
  blush: "glow-blush border-blush",
  lavender: "glow-lavender border-lavender",
  mint: "glow-mint border-mint",
  champagne: "glow-champagne border-champagne",
  sky: "glow-sky border-sky",
  none: "",
};

export function GlassCard({ children, accent = "none", className = "", animDelay = 0 }: GlassCardProps) {
  return (
    <div
      className={`glass-card animate-fade-up ${GLOW_CLASS[accent]} ${className}`}
      style={{ animationDelay: `${animDelay}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}
