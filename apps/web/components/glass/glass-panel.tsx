import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "blue" | "violet" | "mint" | "none";
}

export function GlassPanel({ className, glow = "none", children, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl",
        glow === "blue" && "shadow-[0_0_30px_rgba(79,141,255,0.15)]",
        glow === "violet" && "shadow-[0_0_30px_rgba(155,93,229,0.15)]",
        glow === "mint" && "shadow-[0_0_30px_rgba(0,245,196,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
