import styles from "./TyreStatusChart.module.css";

export interface TyreSegment {
  label: string;
  count: number;
  color: string;
}

interface TyreStatusChartProps {
  total: number;
  segments: TyreSegment[];
}

// ── SVG helpers ─────────────────────────────────────────────────
const CX = 80;
const CY = 80;
const R  = 58;   // radius at stroke centre
const SW = 16;   // stroke width

function toCartesian(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + R * Math.cos(rad),
    y: CY + R * Math.sin(rad),
  };
}

function arcPath(startDeg: number, endDeg: number) {
  const s = toCartesian(startDeg);
  const e = toCartesian(endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${R} ${R} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

// ────────────────────────────────────────────────────────────────

export function TyreStatusChart({ total, segments }: TyreStatusChartProps) {
  const grandTotal = segments.reduce((s, seg) => s + seg.count, 0);
  const GAP_DEG = 2.5;

  let cumAngle = 0;
  const arcs = segments.map((seg) => {
    const span = (seg.count / grandTotal) * 360;
    const start = cumAngle + GAP_DEG / 2;
    const end   = cumAngle + span - GAP_DEG / 2;
    cumAngle += span;
    return { ...seg, start, end };
  });

  return (
    <div className={styles.wrapper}>
      {/* Chart */}
      <div className={styles.chartWrap}>
        <svg
          viewBox="0 0 160 160"
          width="160"
          height="160"
          aria-label="Tyre status donut chart"
          role="img"
        >
          {/* Grey track */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="#e5e8ec"
            strokeWidth={SW}
          />
          {/* Coloured segments */}
          {arcs.map((arc) => (
            <path
              key={arc.label}
              d={arcPath(arc.start, arc.end)}
              fill="none"
              stroke={arc.color}
              strokeWidth={SW}
              strokeLinecap="butt"
            />
          ))}
        </svg>

        {/* Centre label */}
        <div className={styles.center}>
          <span className={styles.centerValue}>{total}</span>
          <span className={styles.centerLabel}>Total</span>
        </div>
      </div>

      {/* Legend */}
      <ul className={styles.legend}>
        {segments.map((seg) => (
          <li key={seg.label} className={styles.legendItem}>
            <span className={styles.dot} style={{ backgroundColor: seg.color }} />
            <span className={styles.legendLabel}>{seg.label}</span>
            <span className={styles.legendCount}>{seg.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
