import Link from "next/link";
import {
  ReceiveIcon, DeliverIcon, ExpenseActivityIcon, PaymentActivityIcon,
} from "@/components/icons";
import styles from "./RecentActivity.module.css";

export type ActivityType = "received" | "delivered" | "expense" | "payment";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  vehicleBadge?: string;
  time: string;
  amount?: string;
  amountColor?: "default" | "danger";
}

const ICON_MAP: Record<ActivityType, { Icon: React.FC<{ size?: number }>; bg: string; color: string }> = {
  received:  { Icon: ReceiveIcon,          bg: "var(--color-neutral-100)",    color: "var(--color-neutral-600)" },
  delivered: { Icon: DeliverIcon,          bg: "var(--color-primary-700)",    color: "#fff" },
  expense:   { Icon: ExpenseActivityIcon,  bg: "#fce8e6",                     color: "#d93025" },
  payment:   { Icon: PaymentActivityIcon,  bg: "var(--color-neutral-100)",    color: "var(--color-neutral-600)" },
};

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Activity</h2>
        <Link href="/activity" className={styles.viewAll}>View All</Link>
      </div>

      <ul className={styles.list}>
        {activities.map((item, i) => {
          const { Icon, bg, color } = ICON_MAP[item.type];
          return (
            <li key={item.id} className={[styles.item, i < activities.length - 1 ? styles.bordered : ""].join(" ")}>
              <span className={styles.iconWrap} style={{ background: bg, color }}>
                <Icon size={18} />
              </span>
              <div className={styles.body}>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemSub}>
                  {item.subtitle}
                  {item.vehicleBadge && (
                    <>
                      <span className={styles.dot}>•</span>
                      <span className={styles.badge}>{item.vehicleBadge}</span>
                    </>
                  )}
                </span>
              </div>
              <div className={styles.meta}>
                <span className={styles.time}>{item.time}</span>
                {item.amount && (
                  <span className={[styles.amount, item.amountColor === "danger" ? styles.amountDanger : ""].join(" ")}>
                    {item.amount}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
