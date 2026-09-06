import styles from "./ProgressBar.module.css";

type ProgressBarVariant = "primary" | "secondary" | "tertiary";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressBarVariant;
  className?: string;
}

export function ProgressBar({ value, max = 100, variant = "primary", className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={[styles.track, className].filter(Boolean).join(" ")} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={[styles.fill, styles[variant]].join(" ")} style={{ width: `${pct}%` }} />
    </div>
  );
}
