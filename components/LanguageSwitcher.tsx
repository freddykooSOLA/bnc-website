'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Lang } from '@/types';
import { LANGUAGES, LANG_LABELS } from '@/lib/i18n';

interface LanguageSwitcherProps {
  lang: Lang;
}

/** 语言切换器 */
export default function LanguageSwitcher({ lang }: LanguageSwitcherProps) {
  const pathname = usePathname();

  /** 将当前路径转换为目标语言路径 */
  function getLangPath(targetLang: Lang): string {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && LANGUAGES.includes(segments[0] as Lang)) {
      segments[0] = targetLang;
    } else {
      segments.unshift(targetLang);
    }
    return '/' + segments.join('/');
  }

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
      {LANGUAGES.map((l) => (
        <Link
          key={l}
          href={getLangPath(l)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
            l === lang
              ? 'bg-orange text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          aria-label={`Switch to ${l}`}
        >
          {LANG_LABELS[l]}
        </Link>
      ))}
    </div>
  );
}
