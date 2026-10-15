import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth, signIn } from '@/auth';
import { getConfig } from '@/lib/config';
import { isValidLang, UI_TEXT } from '@/lib/i18n';
import type { Lang } from '@/types';
import { databaseEnabled, prisma } from '@/lib/prisma';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import { compareMatchDateAsc, formatMatchDateTimeHK } from '@/lib/scorelab-time';
import { teamPagePath } from '@/lib/team-links';
import TeamCalendarLinks from '@/components/TeamCalendarLinks';
import TeamLogo from '@/components/TeamLogo';

interface PageProps {
  params: { lang: string };
}

function findLeagueUrl(leagueId: string): string | null {
  const config = getConfig();
  const league = [...config.matches.leagues, ...config.matches.archiveLeagues].find(
    (l) => l.id === leagueId
  );
  return league?.url ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang as Lang;
  if (!isValidLang(lang)) return {};
  const config = getConfig();
  const t = UI_TEXT[lang];
  return { title: `${t.myTeamsTitle} | ${config.siteName[lang]}` };
}

export default async function MyTeamsPage({ params }: PageProps) {
  const lang = params.lang as Lang;
  if (!isValidLang(lang)) notFound();

  const t = UI_TEXT[lang];
  const session = await auth();

  if (!session?.user?.id) {
    await signIn('google', { redirectTo: `/${lang}/my-teams` });
    return null;
  }

  if (!databaseEnabled()) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-600">
        <h1 className="font-heading text-2xl font-bold text-primary mb-4">
          {t.myTeamsTitle}
        </h1>
        <p>{t.scorelabUnavailable}</p>
      </div>
    );
  }

  let follows: { leagueId: string; teamId: string; teamName: string }[] = [];
  try {
    follows = await prisma.teamFollow.findMany({
      where: { memberId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { leagueId: true, teamId: true, teamName: true },
    });
  } catch {
    follows = [];
  }

  const cards = await Promise.all(
    follows.map(async (f) => {
      const url = findLeagueUrl(f.leagueId);
      let nextMatch: {
        opponent: string;
        date: string;
        homeTeam: string;
        awayTeam: string;
        homeImage?: string;
        awayImage?: string;
      } | null = null;
      let teamImage: string | undefined;

      if (url) {
        try {
          const data = await getCachedSeasonData(url);
          const standing = data.standings.find((s) => s.teamId === f.teamId);
          teamImage = standing?.teamImage;
          const upcoming = data.matches
            .filter(
              (m) =>
                !m.isMatchEnd &&
                (m.homeTeamId === f.teamId || m.awayTeamId === f.teamId)
            )
            .sort((a, b) => compareMatchDateAsc(a.date, b.date));
          const next = upcoming[0];
          if (next) {
            const isHome = next.homeTeamId === f.teamId;
            nextMatch = {
              opponent: isHome ? next.awayTeam : next.homeTeam,
              date: next.date,
              homeTeam: next.homeTeam,
              awayTeam: next.awayTeam,
              homeImage: next.homeTeamImage,
              awayImage: next.awayTeamImage,
            };
          }
        } catch {
          // ignore
        }
      }

      return { follow: f, nextMatch, teamImage };
    })
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
      <h1 className="font-heading text-3xl font-bold text-primary mb-2">
        {t.myTeamsTitle}
      </h1>
      <p className="text-gray-600 mb-10">{t.myTeamsIntro}</p>

      {cards.length === 0 ? (
        <p className="text-gray-500 text-center py-12">{t.myTeamsEmpty}</p>
      ) : (
        <ul className="space-y-6">
          {cards.map(({ follow, nextMatch, teamImage }) => (
            <li key={`${follow.leagueId}-${follow.teamId}`} className="card">
              <div className="flex items-center gap-4 mb-4">
                <TeamLogo name={follow.teamName} imageUrl={teamImage} size={48} />
                <Link
                  href={teamPagePath(lang, follow.leagueId, follow.teamId)}
                  className="font-heading text-xl font-bold text-primary hover:text-orange"
                >
                  {follow.teamName}
                </Link>
              </div>
              {nextMatch ? (
                <div className="text-sm text-gray-700 mb-4">
                  <p className="font-semibold text-orange mb-1">{t.nextGame}</p>
                  <p>
                    {nextMatch.homeTeam} vs {nextMatch.awayTeam}
                  </p>
                  <p className="text-gray-500">
                    {formatMatchDateTimeHK(nextMatch.date, lang)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">{t.noData}</p>
              )}
              <TeamCalendarLinks
                lang={lang}
                leagueId={follow.leagueId}
                teamId={follow.teamId}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
