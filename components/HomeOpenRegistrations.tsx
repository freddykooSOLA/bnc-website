import Link from 'next/link';
import type { Lang } from '@/types';
import { listOpenRegistrations } from '@/lib/open-registrations';

const COPY: Record<
  Lang,
  { heading: string; subheading: string; registerBy: string; cta: string }
> = {
  'zh-hk': {
    heading: '最新活動・接受報名',
    subheading: '以下項目現正接受報名',
    registerBy: '報名截止',
    cta: '立即報名',
  },
  'zh-cn': {
    heading: '最新活动・接受报名',
    subheading: '以下项目现正接受报名',
    registerBy: '报名截止',
    cta: '立即报名',
  },
  en: {
    heading: 'Open for registration',
    subheading: 'You can register for the following now',
    registerBy: 'Closes',
    cta: 'Register now',
  },
};

export default function HomeOpenRegistrations({ lang }: { lang: Lang }) {
  const items = listOpenRegistrations(lang);
  if (items.length === 0) return null;

  const t = COPY[lang];

  return (
    <section className="bg-white border-b border-gray-100" aria-labelledby="home-open-reg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 id="home-open-reg" className="font-heading text-2xl md:text-3xl font-bold text-primary">
          {t.heading}
        </h2>
        <p className="text-base text-gray-600 mt-2 mb-6">{t.subheading}</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={`${item.kind}-${item.slug}`} className="card flex flex-col gap-2">
              <p className="font-heading text-lg font-bold text-primary">{item.title}</p>
              <p className="text-sm text-gray-600">{item.dateLabel}</p>
              <p className="text-sm text-gray-500">
                {t.registerBy}：{item.registerByLabel}
              </p>
              <Link
                href={item.href}
                className="mt-auto min-h-11 inline-flex items-center justify-center px-4 text-base rounded-lg bg-orange text-white hover:opacity-90"
              >
                {t.cta}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}