import * as React from "react";
import { cn } from "@/lib/utils";

interface NumInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | "";
  onChange: (n: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
}

/** Input numérico com teclado decimal nativo, bloqueio de negativos */
export const NumInput = React.forwardRef<HTMLInputElement, NumInputProps>(
  ({ value, onChange, suffix, min = 0, max, className, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value === 0 && document.activeElement !== ref ? "" : value}
          onChange={(e) => {
            const raw = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
            if (raw === "") return onChange(0);
            const n = Number(raw);
            if (!Number.isFinite(n)) return;
            if (n < min) return onChange(min);
            if (max !== undefined && n > max) return onChange(max);
            onChange(n);
          }}
          className={cn(
            "h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors",
            suffix && "pr-12",
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);
NumInput.displayName = "NumInput";
