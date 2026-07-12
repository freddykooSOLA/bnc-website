'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { Lang, SiteConfig } from '@/types';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  lang: Lang;
  config: SiteConfig;
}

/** 全局导航头部 */
export default function Header({ lang, config }: HeaderProps) {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  const navItems = [
    { key: 'home', href: `/${lang}`, label: config.nav.home[lang] },
    { key: 'about', href: `/${lang}/about`, label: config.nav.about[lang] },
    { key: 'matches', href: `/${lang}/matches`, label: config.nav.matches[lang] },
  ];

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href={`/${lang}`} className="flex items-center gap-3 shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0">
              {!logoError ? (
                <Image
                  src={config.logo}
                  alt={config.siteName[lang]}
                  width={48}
                  height={48}
                  className="object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-primary font-bold text-lg">BNC</span>
              )}
            </div>
            <span className="font-heading font-bold text-lg md:text-xl hidden sm:block">
              {config.siteName[lang]}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === `/${lang}`
                  ? pathname === `/${lang}` || pathname === `/${lang}/`
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <LanguageSwitcher lang={lang} />
        </div>

        <nav className="md:hidden flex overflow-x-auto gap-1 pb-3 -mx-4 px-4">
          {navItems.map((item) => {
            const isActive =
              item.href === `/${lang}`
                ? pathname === `/${lang}` || pathname === `/${lang}/`
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-orange text-white'
                    : 'text-white/70 hover:text-white bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
