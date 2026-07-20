import { getHeat } from "../../lib/helpers";

export default function ColdClock({ days, size = 44 }) {
  const heat = getHeat(days);
  const pct = Math.min(days / 30, 1);
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="coldclock" style={{ width: size, height: size }} title={`${heat.label} · ${days}d since contact`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="coldclock-track" strokeWidth="3.5" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={`coldclock-ring heat-${heat.key}`}
          strokeWidth="3.5"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - pct * c}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="coldclock-num">{days}</span>
    </div>
  );
}
