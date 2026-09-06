"use client";

import { TyreStatusBadge, PaymentBadge, type TyreStatus, type PaymentStatus } from "@/components/shared/StatusBadge";
import styles from "./TyreCard.module.css";

interface TyreCardProps {
  vehicleNo: string;
  tyreSize: string;
  qty: number;
  expectedAmt: string;
  date: string;
  status: TyreStatus;
  payment: PaymentStatus;
  partialAmount?: string;
  onDeliver?: () => void;
  onClick?: () => void;
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function TyreCard({
  vehicleNo, tyreSize, qty, expectedAmt, date,
  status, payment, partialAmount, onDeliver, onClick,
}: TyreCardProps) {
  return (
    <div className={styles.card} onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>
      <div className={styles.topRow}>
        <span className={styles.vehicleNo}>{vehicleNo}</span>
        <span className={styles.amount}>{expectedAmt}</span>
      </div>
      <div className={styles.secondRow}>
        <span className={styles.meta}>{tyreSize} &bull; Qty: {qty}</span>
        <span className={styles.date}>{date}</span>
      </div>
      <div className={styles.badges}>
        <TyreStatusBadge status={status} />
        <PaymentBadge status={payment} partialAmount={partialAmount} />
      </div>
      {status === "Pending" && (
        <button className={styles.deliverBtn} onClick={onDeliver}>
          <TruckIcon />
          Deliver Tyres
        </button>
      )}
    </div>
  );
}
