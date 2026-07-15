import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata, generateJsonLd } from '@/lib/seo';
import type { Lang } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LangLayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const { lang: langParam } = params;
  if (!isValidLang(langParam)) return {};
  const lang = langParam as Lang;
  const config = getConfig();
  return generatePageMetadata(lang, config, config.seo.home, '');
}

export default async function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  const { lang: langParam } = params;

  if (!isValidLang(langParam)) {
    notFound();
  }

  const lang = langParam as Lang;
  const config = getConfig();
  const jsonLd = generateJsonLd(config, lang);

  return (
    <>
      <link rel="icon" href={config.favicon} type="image/png" sizes="32x32" />
      <link rel="icon" href={config.favicon} type="image/png" sizes="192x192" />
      <link rel="shortcut icon" href={config.favicon} type="image/png" />
      <link rel="apple-touch-icon" href={config.favicon} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col min-h-screen">
        <Header lang={lang} config={config} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} config={config} />
      </div>
    </>
  );
}
