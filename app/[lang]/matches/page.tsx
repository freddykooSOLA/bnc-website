import type { Metadata } from 'next';
import { getConfig } from '@/lib/config';
import { generatePageMetadata } from '@/lib/seo';
import type { Lang } from '@/types';
import MatchesContent from '@/components/MatchesContent';

interface MatchesPageProps {
  params: { lang: string };
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = params.lang as Lang;
  const config = getConfig();
  return generatePageMetadata(lang, config, config.seo.matches, '/matches');
}

/** 比赛页面 */
export default async function MatchesPage({ params }: MatchesPageProps) {
  const lang = params.lang as Lang;
  const config = getConfig();

  return <MatchesContent lang={lang} config={config} />;
}
