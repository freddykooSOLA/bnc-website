import Link from 'next/link';
import type { Lang } from '@/types';
import { playerPagePath } from '@/lib/player-links';

interface PlayerNameLinkProps {
  lang: Lang;
  leagueId?: string;
  playerId?: string;
  name: string;
  className?: string;
}

export default function PlayerNameLink({
  lang,
  leagueId,
  playerId,
  name,
  className = 'hover:text-orange transition-colors',
}: PlayerNameLinkProps) {
  if (leagueId && playerId) {
    return (
      <Link href={playerPagePath(lang, leagueId, playerId)} className={className}>
        {name}
      </Link>
    );
  }
  return <span className={className}>{name}</span>;
}
