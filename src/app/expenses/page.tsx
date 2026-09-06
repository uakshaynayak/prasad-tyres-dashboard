import { fetchExpenses } from "@/actions/expenses";
import { ExpensesDesktop } from "@/components/expenses/ExpensesDesktop";
import { ExpensesMobile } from "@/components/expenses/ExpensesMobile";
import styles from "./page.module.css";

export default async function ExpensesPage() {
  const { entries, todayEntries, stats } = await fetchExpenses();

  return (
    <>
      <div className={styles.desktop}>
        <ExpensesDesktop data={entries} stats={stats.desktop} />
      </div>
      <div className={styles.mobile}>
        <ExpensesMobile
          data={todayEntries}
          date={stats.todayDateLabel}
          total={stats.todayFormatted}
        />
      </div>
    </>
  );
}
