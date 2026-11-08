import type { Lang } from '@/types';
import { homeFaqBlocks } from '@/lib/home-faq-blocks';

interface HomeFaqBlocksProps {
  lang: Lang;
}

/** 關於我們頁 AEO 答案區塊（SSR，curl 可讀）。不放首頁。 */
export default function HomeFaqBlocks({ lang }: HomeFaqBlocksProps) {
  const blocks = homeFaqBlocks(lang);
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: blocks
      .filter((block) => block.answer)
      .map((block) => ({
        '@type': 'Question',
        name: block.question,
        acceptedAnswer: { '@type': 'Answer', text: block.answer },
      })),
  };

  return (
    <section className="bg-light-bg border-b border-gray-200" aria-label="FAQ">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 space-y-12">
        {blocks.map((block) => (
          <div key={block.question}>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-primary mb-4">
              {block.question}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">{block.answer}</p>
            {block.tableRows.length ? (
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      {block.tableHeaders.map((h) => (
                        <th key={h} className="py-2 pr-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.tableRows.map((row) => (
                      <tr key={row[0]} className="border-b border-gray-100">
                        {row.map((cell, i) => (
                          <td
                            key={`${row[0]}-${i}`}
                            className={`py-2 pr-4 align-top ${i === 0 ? 'font-medium text-primary' : 'text-gray-700'}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ))}
        <p className="text-sm text-gray-600">
          {lang === 'en' ? (
            <>
              Full match data on{' '}
              <a
                href="https://www.scorelab.tech"
                className="text-primary underline-offset-2 hover:underline"
                rel="noopener noreferrer"
              >
                ScoreLab
              </a>
              ; official league site{' '}
              <a href="https://bncleague.com" className="text-primary underline-offset-2 hover:underline">
                bncleague.com
              </a>
              .
            </>
          ) : lang === 'zh-cn' ? (
            <>
              完整赛事数据见{' '}
              <a
                href="https://www.scorelab.tech"
                className="text-primary underline-offset-2 hover:underline"
                rel="noopener noreferrer"
              >
                ScoreLab
              </a>
              ；联赛官网{' '}
              <a href="https://bncleague.com" className="text-primary underline-offset-2 hover:underline">
                bncleague.com
              </a>
              。
            </>
          ) : (
            <>
              完整賽事數據見{' '}
              <a
                href="https://www.scorelab.tech"
                className="text-primary underline-offset-2 hover:underline"
                rel="noopener noreferrer"
              >
                ScoreLab
              </a>
              ；聯賽官網{' '}
              <a href="https://bncleague.com" className="text-primary underline-offset-2 hover:underline">
                bncleague.com
              </a>
              。
            </>
          )}
        </p>
      </div>
    </section>
  );
}
