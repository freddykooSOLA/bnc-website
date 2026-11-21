import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import SignInGate from '@/components/SignInGate';
import BasketballRadar from '@/components/BasketballRadar';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { databaseEnabled } from '@/lib/prisma';
import { loadApprovedPlayerStats } from '@/lib/player-link-service';
import { loadLeaguePlayerStatsFromDb } from '@/lib/scorelab-db';
import {
  aggregateCareerStats,
  buildLeagueRadarPercentiles,
  playerPerGameAverages,
} from '@/lib/basketball-radar';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import type { Lang } from '@/types';

const TITLE: Record<Lang, string> = {
  'zh-hk': '我的籃球數據',
  'zh-cn': '我的篮球数据',
  en: 'My basketball stats',
};

const COPY: Record<
  Lang,
  {
    career: string;
    gp: string;
    perGame: string;
    byLeague: string;
    none: string;
    back: string;
    signIn: string;
  }
> = {
  'zh-hk': {
    career: '生涯合計',
    gp: '場數',
    perGame: '場均',
    byLeague: '各聯賽各隊',
    none: '尚未有已批准的數據連結。',
    back: '返回帳戶',
    signIn: '請先登入以查看你的比賽數據。',
  },
  'zh-cn': {
    career: '生涯合计',
    gp: '场数',
    perGame: '场均',
    byLeague: '各联赛各队',
    none: '尚未有已批准的数据连结。',
    back: '返回账户',
    signIn: '请先登录以查看你的比赛数据。',
  },
  en: {
    career: 'Career totals',
    gp: 'Games',
    perGame: 'Per game',
    byLeague: 'By league & team',
    none: 'No approved stat links yet.',
    back: 'Back to account',
    signIn: 'Sign in to view your game stats.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const title = { 'zh-hk': TITLE['zh-hk'], 'zh-cn': TITLE['zh-cn'], en: TITLE.en };
  return generatePageMetadata(params.lang, getConfig(), { title, description: title }, '/account/stats');
}

function avg(total: number, gp: number): string {
  if (!gp) return '—';
  return (total / gp).toFixed(1);
}

export default async function AccountStatsPage({ params }: { params: { lang: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const copy = COPY[lang];
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SignInGate
          lang={lang}
          callbackPath={`/${lang}/account/stats`}
          prompt={COPY[lang].signIn}
        />
      </div>
    );
  }

  if (!databaseEnabled()) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-base text-gray-600">
        Database unavailable.
      </div>
    );
  }

  const rows = await loadApprovedPlayerStats(session.user.id);
  const career = aggregateCareerStats(rows.map((r) => r.player));
  const config = getConfig();
  const allLeagues = [...config.matches.leagues, ...config.matches.archiveLeagues];

  const radarBlocks: Array<{
    leagueLabel: string;
    percentiles: ReturnType<typeof buildLeagueRadarPercentiles>;
    player: (typeof rows)[0]['player'];
  }> = [];

  for (const row of rows) {
    const league = allLeagues.find((l) => l.id === row.leagueId);
    if (!league) continue;
    const dbStats = await loadLeaguePlayerStatsFromDb(row.leagueId);
    if (dbStats) {
      radarBlocks.push({
        leagueLabel: row.leagueLabel,
        percentiles: buildLeagueRadarPercentiles(row.player, dbStats),
        player: row.player,
      });
      continue;
    }
    try {
      const data = await getCachedSeasonData(league.url);
      if (!data.playerStats) continue;
      radarBlocks.push({
        leagueLabel: row.leagueLabel,
        percentiles: buildLeagueRadarPercentiles(row.player, data.playerStats),
        player: row.player,
      });
    } catch {
      /* skip */
    }
  }

  return (
    <div className="bg-light-bg min-h-[50vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 overflow-x-hidden">
        <Link href={`/${lang}/account`} className="text-sm text-orange hover:underline">
          {copy.back}
        </Link>
        <h1 className="font-heading text-3xl font-bold text-primary">{TITLE[lang]}</h1>

        {rows.length === 0 ? (
          <p className="text-base text-gray-600">{copy.none}</p>
        ) : (
          <>
            <section className="card text-base space-y-2">
              <h2 className="font-heading font-semibold text-primary">{copy.career}</h2>
              <p>
                {copy.gp} {career.games} · {copy.perGame} PTS {avg(career.PTS, career.games)} / REB{' '}
                {avg(career.REB, career.games)} / AST {avg(career.AST, career.games)}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading font-semibold text-primary">{copy.byLeague}</h2>
              <ul className="space-y-3">
                {rows.map((r) => (
                  <li key={`${r.leagueId}-${r.player.playerId}`} className="card text-sm">
                    <p className="font-medium text-primary">{r.leagueLabel}</p>
                    <p className="text-gray-600">{r.player.teamName}</p>
                    <p>
                      {r.player.gamesPlayed} GP · PTS {avg(r.player.PTS, r.player.gamesPlayed)} · REB{' '}
                      {avg(r.player.REB, r.player.gamesPlayed)} · AST{' '}
                      {avg(r.player.AST, r.player.gamesPlayed)} · STL{' '}
                      {avg(r.player.STL, r.player.gamesPlayed)} · BLK{' '}
                      {avg(r.player.BLK, r.player.gamesPlayed)} · 3PM{' '}
                      {avg(r.player['3PM'], r.player.gamesPlayed)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {radarBlocks.map((block) => (
              <section key={block.leagueLabel} className="card space-y-4">
                <h3 className="font-heading font-semibold text-primary">{block.leagueLabel}</h3>
                <BasketballRadar
                  lang={lang}
                  percentiles={block.percentiles}
                  gamesPlayed={block.player.gamesPlayed}
                  averages={playerPerGameAverages(block.player)}
                />
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}