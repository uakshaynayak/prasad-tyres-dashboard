"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { updateTyreAction, recordPaymentAction, type TyreUpdatePayload } from "@/actions/tyreActions";
import styles from "./TyreDetailDrawer.module.css";

// ── API shape ──────────────────────────────────────────────────

export interface ApiTyreDetail {
  _id: string;
  date: string;
  vehicleNo: string;
  tyreSize: string;
  tyreNo: string;
  tyreMake: string;
  rate: number;
  qty: number;
  total: number;
  deliveryStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  tyreId: string | null;
  onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtAmount(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function shortRef(id: string) {
  return `TRX-${id.slice(-8).toUpperCase()}`;
}

// ── Sub-components ─────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const isPending   = status === "Pending";
  const isDelivered = status === "Delivered";
  const isPaid      = status === "Paid";
  const cls = isPaid || isDelivered ? styles.pillGreen
    : isPending ? styles.pillAmber
    : styles.pillGray;
  return <span className={[styles.pill, cls].join(" ")}>{status}</span>;
}

function SectionHead({ icon, label, right }: { icon: React.ReactNode; label: string; right?: React.ReactNode }) {
  return (
    <div className={styles.sectionHead}>
      <span className={styles.sectionIcon}>{icon}</span>
      <span className={styles.sectionLabel}>{label}</span>
      {right && <span className={styles.sectionRight}>{right}</span>}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function TyreDetailDrawer({ tyreId, onClose }: Props) {
  const [detail, setDetail]   = useState<ApiTyreDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [edits, setEdits]     = useState<TyreUpdatePayload>({});
  const [saving, startSave]   = useTransition();
  const [toast, setToast]     = useState<string | null>(null);

  // Delivery date confirmation prompt
  const [deliveryPrompt, setDeliveryPrompt] = useState(false);
  const [deliveryDate,   setDeliveryDate]   = useState(todayISO);

  // Payment date confirmation prompt
  const [paymentPrompt, setPaymentPrompt] = useState(false);
  const [paymentDate,   setPaymentDate]   = useState(todayISO);

  // Fetch detail when id changes
  useEffect(() => {
    if (!tyreId) { setDetail(null); setEditing(false); setEdits({}); return; }
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/tyres/${tyreId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setDetail(j.data);
        else setError(j.message ?? "Failed to load");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [tyreId]);

  // Close on Escape
  useEffect(() => {
    if (!tyreId) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [tyreId, onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = tyreId ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [tyreId]);

  if (!tyreId) return null;

  // Merge original + edits for display
  const d = detail;
  const val = <K extends keyof ApiTyreDetail>(key: K) =>
    (edits as Record<string, unknown>)[key] !== undefined
      ? (edits as Record<string, unknown>)[key]
      : d?.[key];

  function setEdit(key: keyof TyreUpdatePayload, value: unknown) {
    setEdits((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!detail || Object.keys(edits).length === 0) { setEditing(false); return; }
    startSave(async () => {
      const result = await updateTyreAction(detail._id, edits);
      if (result.success) {
        setDetail((prev) => prev ? { ...prev, ...edits } as ApiTyreDetail : prev);
        setEditing(false);
        setEdits({});
        showToast("Saved successfully");
      } else {
        showToast(result.message ?? "Save failed", true);
      }
    });
  }

  function quickUpdate(updates: TyreUpdatePayload) {
    if (!detail) return;
    startSave(async () => {
      const result = await updateTyreAction(detail._id, updates);
      if (result.success) {
        setDetail((prev) => prev ? { ...prev, ...updates } as ApiTyreDetail : prev);
        showToast("Updated successfully");
      } else {
        showToast(result.message ?? "Update failed", true);
      }
    });
  }

  function confirmPayment() {
    if (!detail) return;
    setPaymentPrompt(false);
    startSave(async () => {
      const result = await recordPaymentAction(detail._id, detail.total, paymentDate);
      if (result.success) {
        setDetail((prev) => prev ? { ...prev, paymentStatus: "Paid" } : prev);
        showToast("Payment recorded");
      } else {
        showToast(result.message ?? "Payment failed", true);
      }
    });
  }

  function showToast(msg: string, isErr = false) {
    setToast((isErr ? "✕ " : "✓ ") + msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Shared content ──────────────────────────────────────────

  function renderContent() {
    if (loading) return <div className={styles.loadingState}>Loading…</div>;
    if (error)   return <div className={styles.errorState}>{error}</div>;
    if (!d)      return null;

    const isDelivered = (val("deliveryStatus") as string) === "Delivered";
    const isPaid      = (val("paymentStatus") as string)  === "Paid";

    return (
      <>
        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statBoxLabel}>QUANTITY</span>
            <span className={styles.statBoxValue}>{val("qty") as number} Tyres</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBoxLabel}>EXPECTED TOTAL</span>
            <span className={styles.statBoxValue}>{fmtAmount(Number(val("total")))}</span>
          </div>
          <div className={[styles.statBox, isPaid ? "" : styles.statBoxDanger].join(" ")}>
            <span className={styles.statBoxLabel}>PAYMENT STATUS</span>
            <span className={[styles.statBoxValue, isPaid ? styles.textGreen : styles.textRed].join(" ")}>
              {!isPaid && "● "}{val("paymentStatus") as string}
              {!isPaid && ` · ${fmtAmount(Number(val("total")))}`}
            </span>
          </div>
        </div>

        {/* TYRE SPECIFICATIONS */}
        <div className={styles.section}>
          <SectionHead
            icon={<SpecIcon />}
            label="TYRE SPECIFICATIONS"
            right={<span className={styles.sectionBadge}>
              {(val("deliveryStatus") as string) === "Delivered" ? "Outward Stock" : "Inward Stock"}
            </span>}
          />
          <div className={styles.specGrid}>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Size Profile</span>
              {editing ? (
                <input className={styles.editInput} value={String(val("tyreSize") ?? "")}
                  onChange={(e) => setEdit("tyreSize", e.target.value)} />
              ) : (
                <span className={styles.specValue}>{val("tyreSize") as string}</span>
              )}
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Brand & Make</span>
              {editing ? (
                <input className={styles.editInput} value={String(val("tyreMake") ?? "")}
                  onChange={(e) => setEdit("tyreMake", e.target.value)} />
              ) : (
                <span className={styles.specValue}>{val("tyreMake") as string}</span>
              )}
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Rate (per tyre)</span>
              {editing ? (
                <input className={styles.editInput} type="number" value={String(val("rate") ?? "")}
                  onChange={(e) => setEdit("rate", Number(e.target.value))} />
              ) : (
                <span className={styles.specValue}>{fmtAmount(Number(val("rate")))}</span>
              )}
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Stock Direction</span>
              {editing ? (
                <select className={styles.editSelect} value={String(val("deliveryStatus") ?? "")}
                  onChange={(e) => setEdit("deliveryStatus", e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              ) : (
                <span className={styles.dirBadge} data-delivered={isDelivered}>
                  {isDelivered ? "→ Delivered / Outward" : "↓ Received / Inward Stock"}
                </span>
              )}
            </div>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Tyre Number / Serial</span>
            {editing ? (
              <input className={styles.editInput} value={String(val("tyreNo") ?? "")}
                onChange={(e) => setEdit("tyreNo", e.target.value)} />
            ) : (
              <div className={styles.chipRow}>
                <span className={styles.chip}>{val("tyreNo") as string}</span>
              </div>
            )}
          </div>
        </div>

        {/* VEHICLE INFO */}
        <div className={styles.section}>
          <SectionHead icon={<TruckIcon />} label="VEHICLE & CUSTOMER INFO" />
          <div className={styles.specGrid}>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Vehicle Registration</span>
              {editing ? (
                <input className={styles.editInput} value={String(val("vehicleNo") ?? "")}
                  onChange={(e) => setEdit("vehicleNo", e.target.value)} />
              ) : (
                <span className={styles.specValue}>{val("vehicleNo") as string}</span>
              )}
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Date</span>
              {editing ? (
                <input className={styles.editInput} type="date"
                  value={String(val("date") ?? "").slice(0, 10)}
                  onChange={(e) => setEdit("date", e.target.value)} />
              ) : (
                <span className={styles.specValue}>{fmtDate(String(val("date")))}</span>
              )}
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Quantity</span>
              {editing ? (
                <input className={styles.editInput} type="number" min="1"
                  value={String(val("qty") ?? "")}
                  onChange={(e) => setEdit("qty", Number(e.target.value))} />
              ) : (
                <span className={styles.specValue}>{val("qty") as number} pcs</span>
              )}
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Payment Status</span>
              {editing ? (
                <select className={styles.editSelect} value={String(val("paymentStatus") ?? "")}
                  onChange={(e) => setEdit("paymentStatus", e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              ) : (
                <StatusPill status={val("paymentStatus") as string} />
              )}
            </div>
          </div>
        </div>

        {/* AUDIT TRAIL */}
        <div className={styles.section}>
          <SectionHead icon={<AuditIcon />} label="ACTIVITY AUDIT TRAIL" />
          <div className={styles.timeline}>
            <div className={styles.tlItem}>
              <span className={styles.tlDot} data-color="blue" />
              <div>
                <p className={styles.tlTitle}>Tyre Entry Created</p>
                <p className={styles.tlTime}>{fmtDateTime(d.createdAt)}</p>
              </div>
            </div>
            {d.updatedAt !== d.createdAt && (
              <div className={styles.tlItem}>
                <span className={styles.tlDot} data-color="amber" />
                <div>
                  <p className={styles.tlTitle}>Entry Updated</p>
                  <p className={styles.tlTime}>{fmtDateTime(d.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  const isDelivered = (detail?.deliveryStatus ?? "") === "Delivered";
  const isPaid      = (detail?.paymentStatus  ?? "") === "Paid";

  // ── Desktop drawer ─────────────────────────────────────────

  const DesktopDrawer = (
    <div className={styles.desktopOnly}>
      <div className={styles.desktopOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className={styles.desktopPanel}>

          {/* Header */}
          <div className={styles.desktopHeader}>
            <div className={styles.headerLeft}>
              <span className={styles.headerIcon}><TruckIcon /></span>
              <div>
                <div className={styles.headerTopRow}>
                  <h2 className={styles.vehicleNo}>{detail?.vehicleNo ?? "—"}</h2>
                  {detail && <StatusPill status={detail.deliveryStatus} />}
                </div>
                <p className={styles.headerRef}>
                  Ref: {detail ? shortRef(detail._id) : "—"}
                </p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className={styles.desktopBody}>{renderContent()}</div>

          {/* Footer */}
          {detail && (
            <div className={styles.desktopFooter}>
              {editing ? (
                <>
                  <button className={styles.footerGhost} onClick={() => { setEditing(false); setEdits({}); }} disabled={saving}>Cancel</button>
                  <button className={styles.footerNavy} onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </>
              ) : deliveryPrompt ? (
                <div className={styles.deliveryPrompt}>
                  <span className={styles.deliveryPromptLabel}>Delivery Date</span>
                  <input
                    type="date"
                    className={styles.deliveryDateInput}
                    value={deliveryDate}
                    max={todayISO()}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                  <button className={styles.footerGhost} onClick={() => setDeliveryPrompt(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button
                    className={styles.footerNavy}
                    onClick={() => { setDeliveryPrompt(false); quickUpdate({ deliveryStatus: "Delivered", deliveryDate }); }}
                    disabled={saving || !deliveryDate}
                  >
                    {saving ? "Saving…" : <><DeliverIcon /> Confirm Delivery</>}
                  </button>
                </div>
              ) : paymentPrompt ? (
                <div className={styles.deliveryPrompt}>
                  <span className={styles.deliveryPromptLabel}>Payment Date</span>
                  <input
                    type="date"
                    className={styles.deliveryDateInput}
                    value={paymentDate}
                    max={todayISO()}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                  <button className={styles.footerGhost} onClick={() => setPaymentPrompt(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button
                    className={styles.footerGreen}
                    onClick={confirmPayment}
                    disabled={saving || !paymentDate}
                  >
                    {saving ? "Saving…" : <><PayIcon /> Confirm Payment</>}
                  </button>
                </div>
              ) : (
                <>
                  <button className={styles.footerGhost} onClick={() => setEditing(true)}>
                    <EditIcon /> Edit
                  </button>
                  <button
                    className={styles.footerGreen}
                    onClick={() => { setPaymentDate(todayISO()); setPaymentPrompt(true); }}
                    disabled={isPaid || saving}
                  >
                    <PayIcon /> Record Payment
                  </button>
                  <button
                    className={styles.footerNavy}
                    onClick={() => { setDeliveryDate(todayISO()); setDeliveryPrompt(true); }}
                    disabled={isDelivered || saving}
                  >
                    <DeliverIcon /> Mark as Delivered
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );

  // ── Mobile sheet ───────────────────────────────────────────

  const MobileSheet = (
    <div className={styles.mobileOnly}>
      <div className={styles.mobileSheet}>

        {/* Mobile header */}
        <div className={styles.mobileHeader}>
          <button className={styles.mobileBack} onClick={onClose} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className={styles.mobileHeaderCenter}>
            <p className={styles.mobileHeaderTitle}>Tyre Details</p>
            {detail && <p className={styles.mobileHeaderRef}>Ref: {shortRef(detail._id)}</p>}
          </div>
          <button className={styles.mobileHeaderBtn} aria-label="Print">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </button>
        </div>

        {/* Mobile vehicle card */}
        {detail && (
          <div className={styles.mobileVehicleCard}>
            <div className={styles.mobileVehicleTop}>
              <div>
                <p className={styles.mobileVehicleNo}>{detail.vehicleNo}</p>
                <p className={styles.mobileVehicleMake}>{detail.tyreMake} · {detail.tyreSize}</p>
              </div>
              <StatusPill status={detail.deliveryStatus} />
            </div>
            <hr className={styles.mobileDivider} />
            <div className={styles.mobileMetrics}>
              <div className={styles.mobileMetric}>
                <span className={styles.mobileMetricLabel}>QUANTITY</span>
                <span className={styles.mobileMetricValue}>{detail.qty} Pcs</span>
              </div>
              <div className={styles.mobileMetric}>
                <span className={styles.mobileMetricLabel}>EXPECTED TOTAL</span>
                <span className={styles.mobileMetricValue}>{fmtAmount(detail.total)}</span>
              </div>
              <div className={styles.mobileMetric}>
                <span className={styles.mobileMetricLabel}>PAYMENT</span>
                <span className={[styles.mobileMetricValue, isPaid ? styles.textGreen : styles.textRed].join(" ")}>
                  {detail.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile body */}
        <div className={styles.mobileBody}>{renderContent()}</div>

        {/* Mobile footer */}
        {detail && (
          <div className={styles.mobileFooter}>
            {editing ? (
              <>
                <button className={styles.mobileFooterGhost} onClick={() => { setEditing(false); setEdits({}); }} disabled={saving}>Cancel</button>
                <button className={styles.mobileFooterNavy} onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </>
            ) : deliveryPrompt ? (
              <div className={styles.mobileDeliveryPrompt}>
                <div className={styles.mobileDeliveryRow}>
                  <label className={styles.deliveryPromptLabel}>Delivery Date</label>
                  <input
                    type="date"
                    className={styles.deliveryDateInput}
                    value={deliveryDate}
                    max={todayISO()}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
                <div className={styles.mobileDeliveryBtns}>
                  <button className={styles.mobileFooterGhost} onClick={() => setDeliveryPrompt(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button
                    className={styles.mobileFooterNavy}
                    onClick={() => { setDeliveryPrompt(false); quickUpdate({ deliveryStatus: "Delivered", deliveryDate }); }}
                    disabled={saving || !deliveryDate}
                  >
                    {saving ? "Saving…" : "Confirm"}
                  </button>
                </div>
              </div>
            ) : paymentPrompt ? (
              <div className={styles.mobileDeliveryPrompt}>
                <div className={styles.mobileDeliveryRow}>
                  <label className={styles.deliveryPromptLabel}>Payment Date</label>
                  <input
                    type="date"
                    className={styles.deliveryDateInput}
                    value={paymentDate}
                    max={todayISO()}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                <div className={styles.mobileDeliveryBtns}>
                  <button className={styles.mobileFooterGhost} onClick={() => setPaymentPrompt(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button
                    className={styles.mobileFooterGreen}
                    onClick={confirmPayment}
                    disabled={saving || !paymentDate}
                  >
                    {saving ? "Saving…" : "Confirm Payment"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  className={styles.mobileFooterGreen}
                  onClick={() => { setPaymentDate(todayISO()); setPaymentPrompt(true); }}
                  disabled={isPaid || saving}
                >
                  <PayIcon /> Record Payment
                </button>
                <button
                  className={styles.mobileFooterNavy}
                  onClick={() => { setDeliveryDate(todayISO()); setDeliveryPrompt(true); }}
                  disabled={isDelivered || saving}
                >
                  <DeliverIcon /> Mark Delivered
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(
    <>
      {toast && <div className={styles.toast}>{toast}</div>}
      {DesktopDrawer}
      {MobileSheet}
    </>,
    document.body
  );
}

// ── Inline icons ───────────────────────────────────────────────

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M1 3h15l3 4.5V17H1V3z" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="14.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function SpecIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function PayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function DeliverIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
