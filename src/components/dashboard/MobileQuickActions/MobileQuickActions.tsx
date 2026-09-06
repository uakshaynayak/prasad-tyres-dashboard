import styles from "./MobileQuickActions.module.css";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  bg: string;
  href: string;
}

interface MobileQuickActionsProps {
  actions: QuickAction[];
}

export function MobileQuickActions({ actions }: MobileQuickActionsProps) {
  return (
    <div className={styles.grid}>
      {actions.map(({ label, icon, bg, href }) => (
        <a key={label} href={href} className={styles.tile}>
          <span className={styles.iconWrap} style={{ background: bg }}>
            {icon}
          </span>
          <span className={styles.label}>{label}</span>
        </a>
      ))}
    </div>
  );
}
