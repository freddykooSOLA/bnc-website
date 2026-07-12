import type { Metadata } from 'next';
import { marked } from 'marked';
import { getConfig } from '@/lib/config';
import { generatePageMetadata } from '@/lib/seo';
import { UI_TEXT } from '@/lib/i18n';
import type { Lang } from '@/types';

interface AboutPageProps {
  params: { lang: string };
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = params.lang as Lang;
  const config = getConfig();
  return generatePageMetadata(lang, config, config.seo.about, '/about');
}

/** 关于我们页面 */
export default async function AboutPage({ params }: AboutPageProps) {
  const lang = params.lang as Lang;
  const config = getConfig();
  const t = UI_TEXT[lang];

  const contentHtml = await marked(config.about.content[lang]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-8">
        {config.nav.about[lang]}
      </h1>

      <div
        className="prose-bnc card mb-8"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* 联系方式 */}
      <div className="card mb-8">
        <h2 className="font-heading text-xl font-bold text-primary mb-6">
          {t.contact}
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-orange font-medium w-16 shrink-0">{t.address}</span>
            <span className="text-gray-700">{config.contact.address[lang]}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-orange font-medium w-16 shrink-0">{t.phone}</span>
            <a
              href={`tel:${config.contact.phone.replace(/\s/g, '')}`}
              className="text-primary hover:text-orange transition-colors"
            >
              {config.contact.phone}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-orange font-medium w-16 shrink-0">{t.email}</span>
            <a
              href={`mailto:${config.contact.email}`}
              className="text-primary hover:text-orange transition-colors"
            >
              {config.contact.email}
            </a>
          </div>
        </div>
      </div>

      {/* Google 地图 */}
      <div className="card p-0 overflow-hidden">
        <iframe
          title="Google Map"
          src={config.contact.googleMapEmbedUrl}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
      </div>
    </div>
  );
}
