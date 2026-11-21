import type { Lang } from '@/types';
import { RADAR_AXES, RADAR_LABEL, type RadarAxis } from '@/lib/basketball-radar';

type Props = {
  lang: Lang;
  percentiles: Record<RadarAxis, number>;
  gamesPlayed: number;
  averages?: Record<RadarAxis, number>;
};

const INSUFFICIENT: Record<Lang, string> = {
  'zh-hk': '場數不足（至少 3 場才顯示雷達）',
  'zh-cn': '场数不足（至少 3 场才显示雷达）',
  en: 'Not enough games played (radar needs at least 3).',
};

/** Square viewBox with padding so axis labels fit at 375px width. */
const VB = 300;
const CX = VB / 2;
const CY = VB / 2;
const MAX_R = 92;
const LABEL_R = 116;

export default function BasketballRadar({ lang, percentiles, gamesPlayed, averages }: Props) {
  if (gamesPlayed < 3) {
    const av = averages ?? percentiles;
    return <RadarInsufficientNotice lang={lang} av={av} />;
  }

  const angles = RADAR_AXES.map((_, i) => (Math.PI * 2 * i) / RADAR_AXES.length - Math.PI / 2);

  function point(axis: RadarAxis, scale: number) {
    const idx = RADAR_AXES.indexOf(axis);
    const r = (scale / 100) * MAX_R;
    return {
      x: CX + r * Math.cos(angles[idx]),
      y: CY + r * Math.sin(angles[idx]),
    };
  }

  function labelAnchor(axis: RadarAxis): 'start' | 'middle' | 'end' {
    const idx = RADAR_AXES.indexOf(axis);
    const a = angles[idx];
    const c = Math.cos(a);
    if (c > 0.35) return 'start';
    if (c < -0.35) return 'end';
    return 'middle';
  }

  const gridLevels = [25, 50, 75, 100];
  const dataPoints = RADAR_AXES.map((axis) => point(axis, percentiles[axis]));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full max-w-[min(100%,375px)] mx-auto overflow-visible px-1">
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Basketball ability radar"
      >
        {gridLevels.map((level) => {
          const pts = RADAR_AXES.map((axis) => point(axis, level));
          const d = pts.map((p) => `${p.x},${p.y}`).join(' ');
          return (
            <polygon key={level} points={d} fill="none" stroke="#e5e7eb" strokeWidth={1} />
          );
        })}
        {RADAR_AXES.map((axis) => {
          const outer = point(axis, 100);
          const idx = RADAR_AXES.indexOf(axis);
          const labelPt = {
            x: CX + LABEL_R * Math.cos(angles[idx]),
            y: CY + LABEL_R * Math.sin(angles[idx]),
          };
          const pct = percentiles[axis];
          const avg = averages?.[axis];
          const anchor = labelAnchor(axis);
          return (
            <g key={axis}>
              <line x1={CX} y1={CY} x2={outer.x} y2={outer.y} stroke="#d1d5db" strokeWidth={1} />
              <text
                x={labelPt.x}
                y={labelPt.y - 6}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="#1e3a5f"
                fontSize={14}
                fontWeight={600}
              >
                {RADAR_LABEL[axis][lang]}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + 12}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="#4b5563"
                fontSize={12}
              >
                {pct}%{avg != null ? ` · ${avg.toFixed(1)}` : ''}
              </text>
            </g>
          );
        })}
        <polygon points={polygon} fill="rgba(234,88,12,0.25)" stroke="#ea580c" strokeWidth={2} />
      </svg>
      <ul className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 text-sm text-gray-700">
        {RADAR_AXES.map((axis) => (
          <li key={axis} className="break-words">
            <span className="inline-block w-3 h-3 rounded-sm bg-orange/40 mr-2 align-middle" aria-hidden />
            {RADAR_LABEL[axis][lang]} {percentiles[axis]}%
          </li>
        ))}
      </ul>
    </div>
  );
}

function RadarInsufficientNotice({
  lang,
  av,
}: {
  lang: Lang;
  av: Record<RadarAxis, number>;
}) {
  return (
    <div className="card text-base space-y-2 max-w-full">
      <p className="text-gray-700">{INSUFFICIENT[lang]}</p>
      <ul className="text-sm text-gray-600 space-y-1">
        {RADAR_AXES.map((axis) => (
          <li key={axis}>
            {RADAR_LABEL[axis][lang]}: {av[axis]?.toFixed(1) ?? '—'}
          </li>
        ))}
      </ul>
    </div>
  );
}