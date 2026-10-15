import type { MouseEvent } from 'react';
import type { Lang } from '@/types';
import { UI_TEXT } from '@/lib/i18n';

/** 賽程「看重播」按鈕 */
export default function YoutubeReplayButton({
  youtubeUrl,
  lang,
  onClickStop,
}: {
  youtubeUrl: string;
  lang: Lang;
  onClickStop?: (e: MouseEvent) => void;
}) {
  const t = UI_TEXT[lang];
  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={t.watchReplay}
      aria-label={t.watchReplay}
      onClick={(e) => {
        e.stopPropagation();
        onClickStop?.(e);
      }}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path
          d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"
        />
      </svg>
    </a>
  );
}
