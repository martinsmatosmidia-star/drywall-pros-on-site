import { Hammer } from "lucide-react";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center rounded-xl bg-gradient-primary shadow-glow"
        style={{ width: size, height: size }}
      >
        <Hammer className="text-primary-foreground" style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <div className="text-base font-black tracking-tight text-foreground">Drywall Pro</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Calculadora de obra
        </div>
      </div>
    </div>
  );
}
