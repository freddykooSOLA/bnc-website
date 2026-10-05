import type { Lang } from '@/types';
import { SECTION_COPY } from '@/lib/section-copy';

const WHATSAPP_URL = 'https://wa.me/85290944252';

export default function EventPaymentInstructions({ lang }: { lang: Lang }) {
  const copy = SECTION_COPY[lang];

  return (
    <div className="card space-y-3 border-orange/30 bg-orange/5 text-sm">
      <h2 className="font-heading text-lg font-bold text-primary">{copy.eventPaymentTitle}</h2>
      <p className="text-gray-700">{copy.eventPaymentIntro}</p>
      <ul className="list-disc pl-5 space-y-1 text-gray-700">
        <li>{copy.eventPaymentFps}</li>
        <li>{copy.eventPaymentAlipay}</li>
      </ul>
      <p className="font-medium text-primary">{copy.eventPaymentAccount}</p>
      <p className="text-gray-600">{copy.eventPaymentPayee}</p>
      <p className="text-gray-700">{copy.eventPaymentReceipt}</p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-block text-center"
      >
        {copy.eventPaymentWhatsApp}
      </a>
    </div>
  );
}
