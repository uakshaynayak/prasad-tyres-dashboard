"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import { createTyreAction, type TyreCreatePayload } from "@/actions/tyreActions";
import styles from "./AddEntryModal.module.css";

// ── Types ──────────────────────────────────────────────────────

interface FormState {
  date: string;
  vehicleNo: string;
  tyreSize: string;
  tyreNo: string;
  tyreMake: string;
  rate: string;
  qty: number;
  deliveryStatus: "Pending" | "Delivered";
  paymentStatus: "Pending" | "Paid";
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const INITIAL: FormState = {
  date: todayISO(),
  vehicleNo: "",
  tyreSize: "",
  tyreNo: "",
  tyreMake: "",
  rate: "",
  qty: 1,
  deliveryStatus: "Pending",
  paymentStatus: "Pending",
};

// ── Props ──────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────────────

function buildPayload(form: FormState): TyreCreatePayload {
  return {
    date: form.date,
    vehicleNo: form.vehicleNo.trim().toUpperCase(),
    tyreSize: form.tyreSize.trim(),
    tyreNo: form.tyreNo.trim().toUpperCase(),
    tyreMake: form.tyreMake.trim(),
    rate: parseFloat(form.rate) || 0,
    qty: form.qty,
    deliveryStatus: form.deliveryStatus,
    paymentStatus: form.paymentStatus,
  };
}

function validate(form: FormState): string | null {
  if (!form.date)        return "Date is required.";
  if (!form.vehicleNo.trim()) return "Vehicle number is required.";
  if (!form.tyreSize.trim()) return "Tyre size is required.";
  if (!form.tyreNo.trim())   return "Tyre number is required.";
  if (!form.tyreMake.trim()) return "Brand / Make is required.";
  if (!form.rate || parseFloat(form.rate) <= 0) return "Rate must be greater than 0.";
  if (form.qty < 1)          return "Quantity must be at least 1.";
  return null;
}

// ── Desktop modal ──────────────────────────────────────────────

function DesktopModal({ form, set, onClose, onSubmit, saving, error }: {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className={styles.desktopOverlay} role="dialog" aria-modal="true" aria-label="Add New Entry">
      <div className={styles.desktopPanel}>
        {/* Header */}
        <div className={styles.desktopHeader}>
          <div>
            <h2 className={styles.desktopTitle}>Add New Entry</h2>
            <p className={styles.desktopSubtitle}>Record a new tyre transaction.</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.desktopBody}>
          {/* PRIMARY DETAILS */}
          <section className={styles.section}>
            <p className={styles.sectionLabel}>PRIMARY DETAILS</p>

            {/* Date + Vehicle Number */}
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="d-date">Date</label>
                <input
                  id="d-date"
                  className={styles.input}
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="d-vehicle">Vehicle Number</label>
                <div className={styles.inputWrap}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M1 3h15l3 4.5V17H1V3z" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="14.5" cy="17.5" r="2.5" />
                  </svg>
                  <input
                    id="d-vehicle"
                    className={styles.input}
                    type="text"
                    placeholder="e.g. KA21MA4415"
                    value={form.vehicleNo}
                    onChange={(e) => set("vehicleNo", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tyre Size + Quantity */}
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="d-size">Tyre Size</label>
                <input
                  id="d-size"
                  className={styles.input}
                  type="text"
                  placeholder="e.g. 295/80 R22.5"
                  value={form.tyreSize}
                  onChange={(e) => set("tyreSize", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="d-qty">Quantity</label>
                <input
                  id="d-qty"
                  className={styles.input}
                  type="number"
                  min="1"
                  value={form.qty}
                  onChange={(e) => set("qty", Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>

            {/* Brand + Tyre Number */}
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="d-make">Brand / Make</label>
                <input
                  id="d-make"
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Michelin, MRF"
                  value={form.tyreMake}
                  onChange={(e) => set("tyreMake", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="d-tyreno">Tyre Number</label>
                <input
                  id="d-tyreno"
                  className={styles.input}
                  type="text"
                  placeholder="e.g. TYR-000123"
                  value={form.tyreNo}
                  onChange={(e) => set("tyreNo", e.target.value)}
                />
              </div>
            </div>

            {/* Rate */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="d-rate">Rate (per tyre)</label>
              <div className={styles.prefixWrap}>
                <span className={styles.prefix}>₹</span>
                <input
                  id="d-rate"
                  className={[styles.input, styles.inputPrefixed].join(" ")}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.rate}
                  onChange={(e) => set("rate", e.target.value)}
                />
              </div>
              {form.rate && form.qty > 0 && (
                <p className={styles.rateCalc}>
                  Total: ₹{(parseFloat(form.rate) * form.qty).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </section>

          {/* TRANSACTION TYPE */}
          <section className={styles.section}>
            <p className={styles.sectionLabel}>TRANSACTION TYPE</p>
            <div className={styles.txnTypeGrid}>
              <button
                type="button"
                className={[styles.txnCard, form.deliveryStatus === "Pending" ? styles.txnCardActive : ""].join(" ")}
                onClick={() => set("deliveryStatus", "Pending")}
              >
                {form.deliveryStatus === "Pending" && (
                  <span className={styles.txnCheck}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="#0f4c81" />
                      <path d="M4 8.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className={styles.txnName}>Received</span>
                <span className={styles.txnSub}>Inward Stock</span>
              </button>

              <button
                type="button"
                className={[styles.txnCard, form.deliveryStatus === "Delivered" ? styles.txnCardActive : ""].join(" ")}
                onClick={() => set("deliveryStatus", "Delivered")}
              >
                {form.deliveryStatus === "Delivered" && (
                  <span className={styles.txnCheck}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="#0f4c81" />
                      <path d="M4 8.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M3 9v6h3l5 4V5L6 9H3z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span className={styles.txnName}>Delivered</span>
                <span className={styles.txnSub}>Outward Stock</span>
              </button>
            </div>
          </section>

          {/* PAYMENT STATUS */}
          <section className={styles.section}>
            <p className={styles.sectionLabel}>PAYMENT STATUS</p>
            <div className={styles.statusToggle}>
              <button
                type="button"
                className={[styles.statusBtn, form.paymentStatus === "Pending" ? styles.statusBtnActive : ""].join(" ")}
                onClick={() => set("paymentStatus", "Pending")}
              >
                Pending
              </button>
              <button
                type="button"
                className={[styles.statusBtn, form.paymentStatus === "Paid" ? styles.statusBtnActive : ""].join(" ")}
                onClick={() => set("paymentStatus", "Paid")}
              >
                Paid
              </button>
            </div>
          </section>

          {/* Error */}
          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>

        {/* Footer */}
        <div className={styles.desktopFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className={styles.submitBtn} onClick={onSubmit} disabled={saving}>
            {saving ? (
              "Saving…"
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Entry
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mobile sheet ───────────────────────────────────────────────

function MobileSheet({ form, set, onClose, onSubmit, saving, error }: {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className={styles.mobileSheet} role="dialog" aria-modal="true" aria-label="New Entry">
      {/* Header */}
      <div className={styles.mobileHeader}>
        <button className={styles.mobileBackBtn} onClick={onClose} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className={styles.mobileTitle}>New Entry</h2>
        <div style={{ width: 32 }} />
      </div>

      <div className={styles.mobileBody}>
        {/* Tab switcher */}
        <div className={styles.mobileTabs}>
          <button
            className={[styles.mobileTab, form.deliveryStatus === "Pending" ? styles.mobileTabActive : ""].join(" ")}
            onClick={() => set("deliveryStatus", "Pending")}
          >
            Received
          </button>
          <button
            className={[styles.mobileTab, form.deliveryStatus === "Delivered" ? styles.mobileTabActive : ""].join(" ")}
            onClick={() => set("deliveryStatus", "Delivered")}
          >
            Delivered
          </button>
        </div>

        {/* Date */}
        <div className={styles.mField}>
          <label className={styles.mLabel}>Date</label>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>

        {/* Vehicle Number */}
        <div className={styles.mField}>
          <label className={styles.mLabel}>Vehicle Number</label>
          <div className={styles.inputWrap}>
            <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M1 3h15l3 4.5V17H1V3z" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="14.5" cy="17.5" r="2.5" />
            </svg>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. KA21MA4415"
              value={form.vehicleNo}
              onChange={(e) => set("vehicleNo", e.target.value)}
            />
          </div>
        </div>

        {/* Tyre Size + Quantity */}
        <div className={styles.mTwoCol}>
          <div className={styles.mField}>
            <label className={styles.mLabel}>Tyre Size</label>
            <input
              className={styles.input}
              type="text"
              placeholder="295/80 R22.5"
              value={form.tyreSize}
              onChange={(e) => set("tyreSize", e.target.value)}
            />
          </div>
          <div className={styles.mField}>
            <label className={styles.mLabel}>Quantity</label>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.stepperBtn}
                onClick={() => set("qty", Math.max(1, form.qty - 1))}
                aria-label="Decrease"
              >
                −
              </button>
              <span className={styles.stepperVal}>{form.qty}</span>
              <button
                type="button"
                className={styles.stepperBtn}
                onClick={() => set("qty", form.qty + 1)}
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Brand + Tyre Number */}
        <div className={styles.mTwoCol}>
          <div className={styles.mField}>
            <label className={styles.mLabel}>Brand / Make</label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. Michelin"
              value={form.tyreMake}
              onChange={(e) => set("tyreMake", e.target.value)}
            />
          </div>
          <div className={styles.mField}>
            <label className={styles.mLabel}>Tyre Number</label>
            <input
              className={styles.input}
              type="text"
              placeholder="TYR-000123"
              value={form.tyreNo}
              onChange={(e) => set("tyreNo", e.target.value)}
            />
          </div>
        </div>

        {/* Rate */}
        <div className={styles.mField}>
          <label className={styles.mLabel}>Rate (per tyre)</label>
          <div className={styles.prefixWrap}>
            <span className={styles.prefix}>₹</span>
            <input
              className={[styles.input, styles.inputPrefixed].join(" ")}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.rate}
              onChange={(e) => set("rate", e.target.value)}
            />
          </div>
          {form.rate && form.qty > 0 && (
            <p className={styles.rateCalc}>
              Total: ₹{(parseFloat(form.rate) * form.qty).toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Payment Status */}
        <div className={styles.mField}>
          <label className={styles.mLabel}>Payment Status</label>
          <div className={styles.statusToggle}>
            <button
              type="button"
              className={[styles.statusBtn, form.paymentStatus === "Pending" ? styles.statusBtnActive : ""].join(" ")}
              onClick={() => set("paymentStatus", "Pending")}
            >
              Pending
            </button>
            <button
              type="button"
              className={[styles.statusBtn, form.paymentStatus === "Paid" ? styles.statusBtnActive : ""].join(" ")}
              onClick={() => set("paymentStatus", "Paid")}
            >
              Paid
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>

      {/* Save button */}
      <div className={styles.mobileSavebar}>
        <button type="button" className={styles.saveBtn} onClick={onSubmit} disabled={saving}>
          {saving ? "Saving…" : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Entry
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function AddEntryModal({ open, onClose }: Props) {
  const [form, setForm]   = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [saving, start]   = useTransition();
  const overlayRef        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) { setForm({ ...INITIAL, date: todayISO() }); setError(null); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
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

  function handleSubmit() {
    const err = validate(form);
    if (err) { setError(err); return; }
    setError(null);
    start(async () => {
      const result = await createTyreAction(buildPayload(form));
      if (result.success) {
        onClose();
      } else {
        setError(result.message ?? "Failed to save. Please try again.");
      }
    });
  }

  return createPortal(
    <>
      {/* Desktop modal */}
      <div className={styles.desktopOnly} ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
        <DesktopModal form={form} set={set} onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} />
      </div>
      {/* Mobile sheet */}
      <div className={styles.mobileOnly}>
        <MobileSheet form={form} set={set} onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} />
      </div>
    </>,
    document.body
  );
}
