import type { Lang } from '@/types';
import { UI_TEXT } from '@/lib/i18n';

interface LoadingSpinnerProps {
  lang: Lang;
  message?: string;
}

/** 加载状态指示器 */
export default function LoadingSpinner({ lang, message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-10 h-10 border-4 border-orange/30 border-t-orange rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{message || UI_TEXT[lang].loading}</p>
    </div>
  );
}
