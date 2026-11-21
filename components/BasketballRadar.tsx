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

export default function BasketballRadar({ lang, percentiles, gamesPlayed, averages }: Props) {
  if (gamesPlayed < 3) {
    const av = averages ?? percentiles;
    return <RadarInsufficientNotice lang={lang} av={av} />;
  }

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 110;
  const angles = RADAR_AXES.map((_, i) => (Math.PI * 2 * i) / RADAR_AXES.length - Math.PI / 2);

  function point(axis: RadarAxis, scale: number) {
    const idx = RADAR_AXES.indexOf(axis);
    const r = (scale / 100) * maxR;
    return {
      x: cx + r * Math.cos(angles[idx]),
      y: cy + r * Math.sin(angles[idx]),
    };
  }

  const gridLevels = [25, 50, 75, 100];
  const dataPoints = RADAR_AXES.map((axis) => point(axis, percentiles[axis]));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full max-w-[375px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" role="img" aria-label="Basketball ability radar">
        {gridLevels.map((level) => {
          const pts = RADAR_AXES.map((axis) => point(axis, level));
          const d = pts.map((p) => `${p.x},${p.y}`).join(' ');
          return (
            <polygon
              key={level}
              points={d}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}
        {RADAR_AXES.map((axis) => {
          const outer = point(axis, 100);
          const labelPt = point(axis, 118);
          const pct = percentiles[axis];
          const avg = averages?.[axis];
          return (
            <g key={axis}>
              <line x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#d1d5db" strokeWidth={1} />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-primary text-[11px] font-medium"
              >
                {RADAR_LABEL[axis][lang]}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + 14}
                textAnchor="middle"
                className="fill-gray-600 text-[10px]"
              >
                {pct}%{' '}
                {avg != null ? `· ${avg.toFixed(1)}` : ''}
              </text>
            </g>
          );
        })}
        <polygon points={polygon} fill="rgba(234,88,12,0.25)" stroke="#ea580c" strokeWidth={2} />
      </svg>
      <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
        {RADAR_AXES.map((axis) => (
          <li key={axis}>
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
  av: Record<RadarAxis, number> | Record<RadarAxis, number>;
}) {
  return (
    <div className="card text-base space-y-2">
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