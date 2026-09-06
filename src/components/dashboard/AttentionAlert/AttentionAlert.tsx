import { WarningIcon } from "@/components/icons";
import styles from "./AttentionAlert.module.css";

interface AttentionAlertProps {
  items: string[];
}

export function AttentionAlert({ items }: AttentionAlertProps) {
  if (items.length === 0) return null;

  return (
    <div className={styles.alert} role="alert">
      <div className={styles.header}>
        <WarningIcon size={15} />
        <span className={styles.title}>ATTENTION NEEDED</span>
      </div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item} className={styles.item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
