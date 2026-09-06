import { CalendarIcon } from "@/components/icons";
import styles from "./MobileTodaySummary.module.css";

interface SummaryItem {
  label: string;
  value: string;
  valueColor?: "default" | "danger" | "primary";
}

interface MobileTodaySummaryProps {
  items: SummaryItem[];
}

export function MobileTodaySummary({ items }: MobileTodaySummaryProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <CalendarIcon size={18} />
        <h3 className={styles.title}>Today&apos;s Summary</h3>
      </div>
      <div className={styles.grid}>
        {items.map(({ label, value, valueColor = "default" }) => (
          <div key={label} className={styles.item}>
            <span className={styles.label}>{label}</span>
            <span className={[styles.value, styles[`value_${valueColor}`]].join(" ")}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
