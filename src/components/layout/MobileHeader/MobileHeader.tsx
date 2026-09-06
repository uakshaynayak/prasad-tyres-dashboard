import { QrCodeIcon, PlusIcon } from "@/components/icons";
import styles from "./MobileHeader.module.css";

export function MobileHeader() {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>TyreFlow</span>
      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Scan QR">
          <QrCodeIcon size={20} />
        </button>
        <button className={styles.iconBtn} aria-label="Add new">
          <PlusIcon size={20} />
        </button>
      </div>
    </header>
  );
}
