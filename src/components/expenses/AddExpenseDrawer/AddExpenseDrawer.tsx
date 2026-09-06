"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { createExpenseAction } from "@/actions/expenseActions";
import styles from "./AddExpenseDrawer.module.css";

// ── Types ──────────────────────────────────────────────────────

interface FormState {
  date: string;
  category: string;
  amount: string;
  description: string;
}

const CATEGORIES = [
  "Fuel", "Maintenance", "Rent", "Worker Advance", "Transport", "Other",
];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const INITIAL: FormState = {
  date: todayISO(),
  category: "",
  amount: "",
  description: "",
};

export interface AddExpenseDrawerProps {
  open: boolean;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────

export function AddExpenseDrawer({ open, onClose }: AddExpenseDrawerProps) {
  const [form, setForm]     = useState<FormState>(INITIAL);
  const [error, setError]   = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  useEffect(() => {
    if (open) { setForm({ ...INITIAL, date: todayISO() }); setError(null); }
  }, [open]);

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
    setError(null);
  }

  function validate(): string | null {
    if (!form.date) return "Date is required";
    if (!form.category) return "Category is required";
    const amt = Number(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) return "Enter a valid amount";
    return null;
  }

  function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }

    startSave(async () => {
      const result = await createExpenseAction({
        amount:      Number(form.amount),
        date:        form.date,
        category:    form.category,
        description: form.description,
      });
      if (result.success) {
        onClose();
      } else {
        setError(result.message ?? "Failed to save expense");
      }
    });
  }

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Add New Expense</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Date */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="exp-date">Expense Date</label>
            <div className={styles.dateWrap}>
              <svg className={styles.dateIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                id="exp-date"
                className={styles.dateInput}
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="exp-cat">Category</label>
            <div className={styles.selectWrap}>
              <select
                id="exp-cat"
                className={styles.select}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Amount */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="exp-amt">Amount</label>
            <div className={styles.amountWrap}>
              <span className={styles.amountPre}>₹</span>
              <input
                id="exp-amt"
                className={[styles.input, styles.amountInput].join(" ")}
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="exp-desc">Description <span className={styles.optional}>(Optional)</span></label>
            <textarea
              id="exp-desc"
              className={styles.textarea}
              placeholder="e.g. Petrol expense for delivery"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {saving ? "Saving…" : "Save Expense"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
