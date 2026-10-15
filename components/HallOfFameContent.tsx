'use client';

import type { Lang } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import {
  getHallOfFameData,
  hallAwardDisplayKey,
  placementMedalClass,
  type HallSeason,
} from '@/lib/hall-of-fame-data';

interface HallOfFameContentProps {
  lang: Lang;
}

function SeasonCard({ lang, season }: { lang: Lang; season: HallSeason }) {
  const t = UI_TEXT[lang];

  if (!season.published) {
    return (
      <article id={season.id} className="card scroll-mt-24">
        <h2 className="font-heading text-xl font-bold text-primary mb-3">
          {season.title}
        </h2>
        <p className="text-gray-600">{t.hofSeasonInProgress}</p>
      </article>
    );
  }

  return (
    <article id={season.id} className="card scroll-mt-24">
      <h2 className="font-heading text-xl font-bold text-primary mb-6">
        {season.title}
      </h2>

      {season.placements.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-orange mb-4">{t.hofTeamPlacements}</h3>
          <ul className="space-y-3">
            {season.placements.map((p) => (
              <li
                key={`${p.award}-${p.teamName}`}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3"
              >
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${placementMedalClass(p.award)}`}
                >
                  {p.award === '冠軍'
                    ? t.hofChampion
                    : p.award === '亞軍'
                    ? t.hofRunnerUp
                    : p.award === '季軍'
                    ? t.hofThird
                    : p.award}
                </span>
                <span className="font-medium text-gray-800">{p.teamName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {season.individualAwards.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-orange mb-4">{t.hofIndividualAwards}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {season.individualAwards.map((a) => {
              const labelKey = hallAwardDisplayKey(a.award);
              const awardLabel =
                labelKey === 'steals'
                  ? t.hofAwardSteals
                  : labelKey === 'pts'
                  ? t.hofAwardPts
                  : labelKey === 'reb'
                  ? t.hofAwardReb
                  : labelKey === 'ast'
                  ? t.hofAwardAst
                  : labelKey === 'blk'
                  ? t.hofAwardBlk
                  : labelKey === 'three'
                  ? t.hofAwardThree
                  : a.award;

              return (
                <div
                  key={`${a.award}-${a.teamName}-${a.playerName}-${a.number}`}
                  className="rounded-lg bg-light-bg border border-gray-100 p-4"
                >
                  <div className="text-xs font-semibold text-orange mb-2">{awardLabel}</div>
                  <div className="font-medium text-gray-900">
                    #{a.number} {a.playerName}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{a.teamName}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

export default function HallOfFameContent({ lang }: HallOfFameContentProps) {
  const t = UI_TEXT[lang];
  const data = getHallOfFameData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-3">
        {t.hofTitle}
      </h1>
      <p className="text-gray-600 mb-10 max-w-2xl">{t.hofIntro}</p>
      <div className="space-y-8">
        {data.seasons.map((season) => (
          <SeasonCard key={season.id} lang={lang} season={season} />
        ))}
      </div>
    </div>
  );
}
