import styles from "./StatusBadge.module.css";

export type TyreStatus  = "Pending" | "Delivered";
export type PaymentStatus = "Unpaid" | "Partial" | "Paid";

interface StatusBadgeProps {
  label: string;
  variant: "pending" | "delivered" | "unpaid" | "partial" | "paid";
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span className={[styles.badge, styles[variant]].join(" ")}>
      {label}
    </span>
  );
}

// Convenience helpers so callers don't hard-code variant strings
export function TyreStatusBadge({ status }: { status: TyreStatus }) {
  return (
    <StatusBadge
      label={status}
      variant={status === "Pending" ? "pending" : "delivered"}
    />
  );
}

export function PaymentBadge({
  status,
  partialAmount,
}: {
  status: PaymentStatus;
  partialAmount?: string;
}) {
  const label =
    status === "Partial" && partialAmount
      ? `Partial (${partialAmount})`
      : status;

  const variant: StatusBadgeProps["variant"] =
    status === "Paid" ? "paid" : status === "Partial" ? "partial" : "unpaid";

  return <StatusBadge label={label} variant={variant} />;
}
