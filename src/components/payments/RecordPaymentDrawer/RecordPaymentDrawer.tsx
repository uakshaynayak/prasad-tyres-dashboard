"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./RecordPaymentDrawer.module.css";

// ── Types ──────────────────────────────────────────────────────

type PaymentMode = "cash" | "online" | "card" | "pending";

interface FormState {
  date: string;
  customer: string;
  amount: string;
  mode: PaymentMode;
  referenceId: string;
  notes: string;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const INITIAL: FormState = {
  date: todayISO(),
  customer: "",
  amount: "",
  mode: "cash",
  referenceId: "",
  notes: "",
};

export interface RecordPaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: FormState) => void;
}

// ── Payment mode card ──────────────────────────────────────────

function ModeIcon({ mode }: { mode: PaymentMode }) {
  if (mode === "cash") return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
  if (mode === "online") return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 9l2 2 4-4" /><rect x="9" y="3" width="12" height="18" rx="2" />
      <line x1="13" y1="8" x2="17" y2="8" /><line x1="13" y1="12" x2="17" y2="12" /><line x1="13" y1="16" x2="17" y2="16" />
    </svg>
  );
  if (mode === "card") return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const MODES: { id: PaymentMode; label: string }[] = [
  { id: "cash",    label: "Cash"    },
  { id: "online",  label: "Online"  },
  { id: "card",    label: "Card"    },
  { id: "pending", label: "Pending" },
];

// ── Component ──────────────────────────────────────────────────

export function RecordPaymentDrawer({ open, onClose, onSubmit }: RecordPaymentDrawerProps) {
  const [form, setForm] = useState<FormState>(INITIAL);

  useEffect(() => { if (open) setForm({ ...INITIAL, date: todayISO() }); }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    onSubmit?.(form);
    onClose();
  }

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.drawer}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Record Payment</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Payment Date */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pay-date">Payment Date</label>
            <input
              id="pay-date"
              className={styles.input}
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>

          {/* Customer / Vehicle Number */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pay-customer">Customer / Vehicle Number</label>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="pay-customer"
                className={[styles.input, styles.searchInput].join(" ")}
                type="text"
                placeholder="Search customer name or vehicle..."
                value={form.customer}
                onChange={(e) => set("customer", e.target.value)}
              />
            </div>
          </div>

          {/* Amount Received */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pay-amount">Amount Received</label>
            <div className={styles.amountWrap}>
              <span className={styles.amountPre}>$</span>
              <input
                id="pay-amount"
                className={[styles.input, styles.amountInput].join(" ")}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div className={styles.field}>
            <label className={styles.label}>Payment Mode</label>
            <div className={styles.modeGrid}>
              {MODES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={[styles.modeBtn, form.mode === id ? styles.modeBtnActive : ""].join(" ")}
                  onClick={() => set("mode", id)}
                >
                  <ModeIcon mode={id} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference ID */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="pay-ref">Reference ID / Cheque No.</label>
              <span className={styles.optional}>Optional</span>
            </div>
            <input
              id="pay-ref"
              className={styles.input}
              type="text"
              placeholder="e.g. TXN-98234-XYZ"
              value={form.referenceId}
              onChange={(e) => set("referenceId", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="pay-notes">Notes</label>
              <span className={styles.optional}>Optional</span>
            </div>
            <textarea
              id="pay-notes"
              className={styles.textarea}
              placeholder="Add any additional details here..."
              rows={4}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.saveBtn} onClick={handleSubmit}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Record Payment
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
