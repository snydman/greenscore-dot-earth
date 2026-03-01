import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--gs-accent)] text-white shadow-sm hover:bg-[color:var(--gs-accent-deep)] focus-visible:ring-2 focus-visible:ring-emerald-600/40",
  secondary:
    "border border-[color:var(--gs-border-subtle)] bg-white/70 text-[color:var(--gs-text-main)] shadow-sm hover:bg-white focus-visible:ring-2 focus-visible:ring-emerald-600/30",
  ghost:
    "text-[color:var(--gs-text-muted)] hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-emerald-600/25",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return <div className={clsx("gs-card w-full px-6 py-7 sm:px-8", className)}>{children}</div>;
}

type ProgressProps = {
  current: number;
  total: number;
};

export function StepProgress({ current, total }: ProgressProps) {
  const safeCurrent = Math.min(Math.max(current, 1), total);
  const percent = (safeCurrent / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Step {safeCurrent} of {total}
        </p>
        <span className="gs-chip" aria-label={`Progress ${safeCurrent} of ${total}`}>
          {Math.round(percent)}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-300 transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}