import { TrendUpIcon } from "@/components/icons";
import styles from "./StatCard.module.css";

interface Trend {
  direction: "up" | "down";
  value: string;
}

interface Badge {
  text: string;
  variant: "warning" | "danger";
}

interface StatCardProps {
  label: string;
  value: string;
  trend?: Trend;
  badge?: Badge;
  valueColor?: "default" | "danger" | "primary";
  labelColor?: "default" | "primary";
}

export function StatCard({ label, value, trend, badge, valueColor = "default", labelColor = "default" }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={[styles.label, styles[`label_${labelColor}`]].join(" ")}>{label}</span>
      <div className={styles.valueRow}>
        <span className={[styles.value, styles[`value_${valueColor}`]].join(" ")}>{value}</span>
        {trend && (
          <span className={[styles.trend, styles[`trend_${trend.direction}`]].join(" ")}>
            <TrendUpIcon size={12} />
            {trend.value}
          </span>
        )}
        {badge && (
          <span className={[styles.badge, styles[`badge_${badge.variant}`]].join(" ")}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}
