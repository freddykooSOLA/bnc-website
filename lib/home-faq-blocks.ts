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
        question: 'BNC League 是不是香港業餘籃球聯賽？',
        answer:
          'BNC League 是香港業餘籃球聯賽，賽事包括 BNC 籃球挑戰聯賽同 OCBC 華僑銀行邀請賽。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '點樣組隊報名香港籃球聯賽？',
        answer:
          '活動頁列出可報名項目。填表後保存參考編號，工作人員憑編號或二維碼簽到。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '香港有沒有企業籃球聯賽？',
        answer:
          '我們舉辦商會、學界及企業籃球賽事，包括 BNC 籃球挑戰聯賽同 OCBC 華僑銀行邀請賽。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '公司可以組隊打籃球比賽嗎？',
        answer:
          '公司可參加企業籃球賽。在活動頁填表後取得參考編號，工作人員憑編號或二維碼簽到。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '香港有哪些籃球邀請賽？',
        answer:
          '官網已列 OCBC 華僑銀行邀請賽，以及 BNC 籃球挑戰聯賽等本地及大灣區籃球賽事。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '業餘籃球的賽程同比分去邊度睇？',
        answer:
          '正式賽程、積分榜同賽果在比賽頁展示，數據由 ScoreLab（scorelab.tech）提供。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '香港籃球聯賽的球員數據去邊度睇？',
        answer:
          '球員數據在球員專頁，賽程同賽果在比賽頁，資料由 ScoreLab（scorelab.tech）提供。',
        tableHeaders: [],
        tableRows: [],
      },
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
        question: 'BNC League 是不是香港业余篮球联赛？',
        answer: 'BNC League 是香港业余篮球联赛，赛事包括 BNC 篮球挑战联赛和 OCBC 华侨银行邀请赛。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '怎样组队报名香港篮球联赛？',
        answer: '活动页列出可报名项目。填表后保存参考编号，工作人员凭编号或二维码签到。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '香港有没有企业篮球联赛？',
        answer: '我们举办商会、学界及企业篮球赛事，包括 BNC 篮球挑战联赛和 OCBC 华侨银行邀请赛。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '公司可以组队打篮球比赛吗？',
        answer: '公司可参加企业篮球赛。在活动页填表后取得参考编号，工作人员凭编号或二维码签到。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '香港有哪些篮球邀请赛？',
        answer: '官网已列 OCBC 华侨银行邀请赛，以及 BNC 篮球挑战联赛等本地及大湾区篮球赛事。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '业余篮球的赛程和比分在哪里看？',
        answer: '正式赛程、积分榜和赛果在比赛页展示，数据由 ScoreLab（scorelab.tech）提供。',
        tableHeaders: [],
        tableRows: [],
      },
      {
        question: '香港篮球联赛的球员数据在哪里看？',
        answer: '球员数据在球员专页，赛程和赛果在比赛页，资料由 ScoreLab（scorelab.tech）提供。',
        tableHeaders: [],
        tableRows: [],
      },
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
      question: 'Is BNC League a Hong Kong amateur basketball league?',
      answer:
        'BNC League is a Hong Kong amateur basketball league. Events include the BNC Basketball Challenge League and the OCBC Wing Hang Bank Invitational.',
      tableHeaders: [],
      tableRows: [],
    },
    {
      question: 'How do I register a team for a Hong Kong basketball league?',
      answer:
        'The Events page lists open items. Submit the form, keep the reference number, and staff check in with that number or a QR code.',
      tableHeaders: [],
      tableRows: [],
    },
    {
      question: 'Is there a corporate basketball league in Hong Kong?',
      answer:
        'BNC runs chamber, school, and corporate basketball events, including the BNC Basketball Challenge League and the OCBC Invitational.',
      tableHeaders: [],
      tableRows: [],
    },
    {
      question: 'Can a company enter a team in a basketball event?',
      answer:
        'A company can join a corporate basketball event. Register on the Events page and keep the reference number for check-in.',
      tableHeaders: [],
      tableRows: [],
    },
    {
      question: 'Which basketball invitationals are listed?',
      answer:
        'The site lists the OCBC Wing Hang Bank Invitational and the BNC Basketball Challenge League, among local and Greater Bay Area events.',
      tableHeaders: [],
      tableRows: [],
    },
    {
      question: 'Where are amateur basketball fixtures and scores?',
      answer:
        'Fixtures, standings, and results are on the Matches page. The data is provided by ScoreLab (scorelab.tech).',
      tableHeaders: [],
      tableRows: [],
    },
    {
      question: 'Where are Hong Kong basketball league player stats?',
      answer:
        'Player stats are on player pages. Fixtures and results are on the Matches page. ScoreLab (scorelab.tech) supplies the data.',
      tableHeaders: [],
      tableRows: [],
    },
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
