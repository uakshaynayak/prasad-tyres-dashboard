"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./AddSpecDrawer.module.css";

// ── Types ──────────────────────────────────────────────────────

type VehicleCategory = "Truck" | "LCV" | "OTR";

interface FormState {
  brand: string;
  modelName: string;
  tyreSize: string;
  plyRating: string;
  patternType: string;
  vehicleCategory: VehicleCategory;
  defaultPrice: string;
}

const BRANDS = ["Apollo", "MRF", "CEAT", "Bridgestone", "Michelin", "JK Tyre", "Goodyear", "TVS"];
const PLY_RATINGS = ["14 PR", "16 PR", "18 PR", "20 PR", "22 PR"];
const PATTERN_TYPES = ["Rib", "Lug", "Mixed", "All-Position"];

const INITIAL: FormState = {
  brand: "",
  modelName: "",
  tyreSize: "",
  plyRating: "",
  patternType: "",
  vehicleCategory: "Truck",
  defaultPrice: "",
};

export interface AddSpecDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: FormState) => void;
}

// ── Section heading ────────────────────────────────────────────

function SectionHead({ label }: { label: string }) {
  return (
    <div className={styles.sectionHead}>
      <span className={styles.sectionLabel}>{label}</span>
      <hr className={styles.sectionRule} />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────

export function AddSpecDrawer({ open, onClose, onSubmit }: AddSpecDrawerProps) {
  const [form, setForm] = useState<FormState>(INITIAL);

  useEffect(() => { if (open) setForm(INITIAL); }, [open]);

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
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Add New Specification</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* IDENTIFICATION */}
          <SectionHead label="IDENTIFICATION" />

          <div className={styles.field}>
            <label className={styles.label}>Brand</label>
            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
              >
                <option value="">Select Brand</option>
                {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Model Name</label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. X Multi D"
              value={form.modelName}
              onChange={(e) => set("modelName", e.target.value)}
            />
          </div>

          {/* TECHNICAL SPECS */}
          <SectionHead label="TECHNICAL SPECS" />

          <div className={styles.field}>
            <label className={styles.label}>Tyre Size</label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. 295/80R22.5"
              value={form.tyreSize}
              onChange={(e) => set("tyreSize", e.target.value)}
            />
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Ply Rating</label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={form.plyRating}
                  onChange={(e) => set("plyRating", e.target.value)}
                >
                  <option value="">Select</option>
                  {PLY_RATINGS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Pattern Type</label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={form.patternType}
                  onChange={(e) => set("patternType", e.target.value)}
                >
                  <option value="">Select</option>
                  {PATTERN_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* CLASSIFICATION */}
          <SectionHead label="CLASSIFICATION" />

          <div className={styles.field}>
            <label className={styles.label}>Vehicle Category</label>
            <div className={styles.categoryGroup}>
              {(["Truck", "LCV", "OTR"] as VehicleCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={[styles.categoryBtn, form.vehicleCategory === cat ? styles.categoryBtnActive : ""].join(" ")}
                  onClick={() => set("vehicleCategory", cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* PRICING */}
          <SectionHead label="PRICING" />

          <div className={styles.field}>
            <label className={styles.label}>Default Price</label>
            <div className={styles.priceWrap}>
              <span className={styles.pricePre}>$</span>
              <input
                className={[styles.input, styles.priceInput].join(" ")}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.defaultPrice}
                onChange={(e) => set("defaultPrice", e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.saveBtn} onClick={handleSubmit}>Save Specification</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
