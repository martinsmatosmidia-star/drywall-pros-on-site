import * as React from "react";
import { cn } from "@/lib/utils";

interface NumInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | "";
  onChange: (n: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
}

/** Input numérico com teclado decimal nativo, aceita vírgula ou ponto, bloqueia negativos */
export const NumInput = React.forwardRef<HTMLInputElement, NumInputProps>(
  ({ value, onChange, suffix, min = 0, max, className, onBlur, onFocus, ...props }, ref) => {
    // Estado local em string permite digitar "2," ou "2." sem perder o caractere
    const [local, setLocal] = React.useState<string>(
      value === "" || value === 0 ? "" : String(value).replace(".", ",")
    );
    const [focused, setFocused] = React.useState(false);

    // Sincroniza quando o valor externo muda e o input não está em foco
    React.useEffect(() => {
      if (!focused) {
        setLocal(value === "" || value === 0 ? "" : String(value).replace(".", ","));
      }
    }, [value, focused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Permite apenas dígitos, vírgula e ponto
      let raw = e.target.value.replace(/[^0-9.,]/g, "");
      // Mantém apenas o primeiro separador decimal
      const firstSep = raw.search(/[.,]/);
      if (firstSep !== -1) {
        raw = raw.slice(0, firstSep + 1) + raw.slice(firstSep + 1).replace(/[.,]/g, "");
      }
      setLocal(raw);

      if (raw === "" || raw === "," || raw === ".") {
        onChange(0);
        return;
      }
      const n = Number(raw.replace(",", "."));
      if (!Number.isFinite(n)) return;
      if (n < min) return onChange(min);
      if (max !== undefined && n > max) return onChange(max);
      onChange(n);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      // Normaliza a exibição ao sair do campo
      if (local === "" || local === "," || local === ".") {
        setLocal("");
      } else {
        const n = Number(local.replace(",", "."));
        if (Number.isFinite(n)) {
          setLocal(String(n).replace(".", ","));
        }
      }
      onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={local}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
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
