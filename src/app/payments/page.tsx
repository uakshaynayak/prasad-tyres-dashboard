import { fetchPayments } from "@/actions/payments";
import { PaymentsDesktop } from "@/components/payments/PaymentsDesktop";
import { PaymentsMobile } from "@/components/payments/PaymentsMobile";
import styles from "./page.module.css";

export default async function PaymentsPage() {
  const { entries, stats } = await fetchPayments();

  return (
    <>
      <div className={styles.desktop}>
        <PaymentsDesktop data={entries} stats={stats.desktop} />
      </div>
      <div className={styles.mobile}>
        <PaymentsMobile data={entries} stats={stats.mobile} />
      </div>
    </>
  );
}
