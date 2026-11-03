import type { Lang } from '@/types';

export type HomeFaqBlock = {
  question: string;
  answer: string;
  tableHeaders: string[];
  tableRows: string[][];
};

/** HQ-103 R3 #7：只用官網已有事實（報名流程、賽制／數據來源） */
export function homeFaqBlocks(lang: Lang): HomeFaqBlock[] {
  if (lang === 'zh-hk') {
    return [
      {
        question: '點樣報名 BNC 活動或聯賽？',
        answer:
          '網站「活動」頁列出可報名項目；填表提交後會取得參考編號，工作人員可憑編號或二維碼簽到。名額滿或截止後無法再報。',
        tableHeaders: ['步驟', '說明'],
        tableRows: [
          ['選擇活動', '於活動頁查看項目與名額'],
          ['網上報名', '提交表單並保存參考編號'],
          ['付款／確認', '部分活動詳情頁會列 FPS／Alipay 等付款指引（以該頁為準）'],
          ['聯絡', '電話 852 9213 3533；電郵 bncsportshkg@gmail.com'],
        ],
      },
      {
        question: 'BNC 聯賽賽制同賽果去邊度睇？',
        answer:
          '正式賽程、積分榜同賽果喺「比賽」頁展示，數據由 ScoreLab（scorelab.tech）提供；本頁標示為 BNC 聯賽數據。',
        tableHeaders: ['項目', '說明'],
        tableRows: [
          ['聯賽類型', '官網已列 BNC 籃球挑戰聯賽、OCBC 華僑銀行邀請賽等本地及大灣區賽事'],
          ['數據頁', '比賽頁積分／賽果；可連至 ScoreLab 賽季頁查看完整資料'],
          ['其他運動', '官網介紹亦舉辦排球、匹克球、桌球、體能挑戰及運動會等合作賽事'],
        ],
      },
    ];
  }
  if (lang === 'zh-cn') {
    return [
      {
        question: '怎样报名 BNC 活动或联赛？',
        answer:
          '网站「活动」页列出可报名项目；填表提交后会取得参考编号，工作人员可凭编号或二维码签到。名额满或截止后无法再报。',
        tableHeaders: ['步骤', '说明'],
        tableRows: [
          ['选择活动', '于活动页查看项目与名额'],
          ['网上报名', '提交表单并保存参考编号'],
          ['付款／确认', '部分活动详情页会列 FPS／Alipay 等付款指引（以该页为准）'],
          ['联络', '电话 852 9213 3533；电邮 bncsportshkg@gmail.com'],
        ],
      },
      {
        question: 'BNC 联赛赛制和赛果在哪里看？',
        answer:
          '正式赛程、积分榜和赛果在「比赛」页展示，数据由 ScoreLab（scorelab.tech）提供；本页标示为 BNC 联赛数据。',
        tableHeaders: ['项目', '说明'],
        tableRows: [
          ['联赛类型', '官网已列 BNC 篮球挑战联赛、OCBC 华侨银行邀请赛等本地及大湾区赛事'],
          ['数据页', '比赛页积分／赛果；可连至 ScoreLab 赛季页查看完整资料'],
          ['其他运动', '官网介绍亦举办排球、匹克球、桌球、体能挑战及运动会等合作赛事'],
        ],
      },
    ];
  }
  return [
    {
      question: 'How do I register for a BNC event or league?',
      answer:
        'Open the Events page, complete the form, and keep your reference number for check-in. Registration closes when the event is full or past the deadline.',
      tableHeaders: ['Step', 'Details'],
      tableRows: [
        ['Pick an event', 'See capacity and dates on the Events page'],
        ['Register online', 'Submit the form and save your reference number'],
        ['Payment', 'Some event pages list FPS / Alipay instructions (follow that page)'],
        ['Contact', 'Phone 852 9213 3533 · bncsportshkg@gmail.com'],
      ],
    },
    {
      question: 'Where are BNC league rules and results published?',
      answer:
        'Fixtures, standings, and results are on the Matches page. Data is powered by ScoreLab (scorelab.tech) and labelled as BNC League data.',
      tableHeaders: ['Topic', 'Details'],
      tableRows: [
        ['Leagues', 'Site lists the BNC Basketball Challenge League, OCBC Wing Hang Bank Invitational, and other local / GBA events'],
        ['Data', 'Standings and results on Matches; full season detail on linked ScoreLab pages'],
        ['Other sports', 'Site also describes volleyball, pickleball, table tennis, fitness challenges, and sports days with partners'],
      ],
    },
  ];
}
