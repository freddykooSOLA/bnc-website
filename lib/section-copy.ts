import type { Lang } from '@/types';

/** 商店與活動頁的固定文案。導航仍走現有三語站。 */
export const SECTION_COPY: Record<Lang, {
  shop: string;
  events: string;
  cart: string;
  pricePending: string;
  stockUnset: string;
  sampleBanner: string;
  addToCart: string;
  size: string;
  color: string;
  teamName: string;
  teamNameHint: string;
  qty: string;
  emptyCart: string;
  checkout: string;
  continueShop: string;
  checkoutTitle: string;
  mockPay: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  placeOrder: string;
  orderTitle: string;
  orderMock: string;
  eventsBanner: string;
  register: string;
  team: string;
  ticketTitle: string;
  ticketHint: string;
  ref: string;
  checkinTitle: string;
  checkinHint: string;
  lookup: string;
  scan: string;
  scanUnsupported: string;
  markIn: string;
  checkedIn: string;
  notChecked: string;
  noRegistrations: string;
  homeShop: string;
  homeEvents: string;
  homeShopBody: string;
  homeEventsBody: string;
  allCategories: string;
  view: string;
  back: string;
  required: string;
  contactOptional: string;
}> = {
  'zh-hk': {
    shop: '商店',
    events: '活動',
    cart: '購物車',
    pricePending: '建議售價待確認',
    stockUnset: '庫存未設定',
    sampleBanner: '以下是示例商品，方便先看分類、規格與結帳版面。照片、貨號、庫存及最終售價都尚未確認，亦未連接任何支付。',
    addToCart: '加入購物車',
    size: '尺碼',
    color: '顏色',
    teamName: '隊名（可選）',
    teamNameHint: '只會印在這張示例訂單上，不會送去製作。',
    qty: '數量',
    emptyCart: '購物車是空的。',
    checkout: '前往結帳',
    continueShop: '繼續選購',
    checkoutTitle: '示範結帳',
    mockPay: '這一步不會扣款，也沒有連接支付閘道。送出後只會產生一張可查看的示例訂單。',
    name: '姓名',
    phone: '電話',
    email: '電郵（可選）',
    note: '備註（可選）',
    placeOrder: '送出示例訂單',
    orderTitle: '示例訂單',
    orderMock: '訂單已記錄，狀態為待支付示例。沒有收款。',
    eventsBanner: '以下是示例活動，用來先跑通報名與簽到。日期、場地、費用及名額都待確認，並非正式賽程。正式賽程仍在「比賽」頁。',
    register: '報名',
    team: '球隊名稱',
    ticketTitle: '報名確認',
    ticketHint: '請保存參考編號或二維碼。工作人員可在後台掃碼或手動輸入此編號簽到。',
    ref: '參考編號',
    checkinTitle: '活動簽到',
    checkinHint: '輸入參考編號、姓名或球隊，或用支援的瀏覽器鏡頭掃描報名二維碼。',
    lookup: '查找',
    scan: '開啟鏡頭掃碼',
    scanUnsupported: '此瀏覽器不支援鏡頭掃碼，請改用手動輸入。',
    markIn: '標記已簽到',
    checkedIn: '已簽到',
    notChecked: '未簽到',
    noRegistrations: '未找到報名紀錄。',
    homeShop: '運動用品商店',
    homeEvents: '活動報名',
    homeShopBody: '運動服、團體服與運動用品示例貨架。售價待確認。',
    homeEventsBody: '報名後取得參考編號，工作人員可簽到。目前為示例活動。',
    allCategories: '全部分類',
    view: '查看',
    back: '返回',
    required: '請填寫必填欄位。',
    contactOptional: '電郵如有填寫，只用於這張紀錄。',
  },
  'zh-cn': {
    shop: '商店',
    events: '活动',
    cart: '购物车',
    pricePending: '建议售价待确认',
    stockUnset: '库存未设定',
    sampleBanner: '以下是示例商品，方便先看分类、规格与结账版面。照片、货号、库存及最终售价都尚未确认，亦未连接任何支付。',
    addToCart: '加入购物车',
    size: '尺码',
    color: '颜色',
    teamName: '队名（可选）',
    teamNameHint: '只会记在这张示例订单上，不会送去制作。',
    qty: '数量',
    emptyCart: '购物车是空的。',
    checkout: '前往结账',
    continueShop: '继续选购',
    checkoutTitle: '示范结账',
    mockPay: '这一步不会扣款，也没有连接支付网关。送出后只会产生一张可查看的示例订单。',
    name: '姓名',
    phone: '电话',
    email: '邮箱（可选）',
    note: '备注（可选）',
    placeOrder: '送出示例订单',
    orderTitle: '示例订单',
    orderMock: '订单已记录，状态为待支付示例。没有收款。',
    eventsBanner: '以下是示例活动，用来先跑通报名与签到。日期、场地、费用及名额都待确认，并非正式赛程。正式赛程仍在「比赛」页。',
    register: '报名',
    team: '球队名称',
    ticketTitle: '报名确认',
    ticketHint: '请保存参考编号或二维码。工作人员可在后台扫码或手动输入此编号签到。',
    ref: '参考编号',
    checkinTitle: '活动签到',
    checkinHint: '输入参考编号、姓名或球队，或用支持的浏览器镜头扫描报名二维码。',
    lookup: '查找',
    scan: '开启镜头扫码',
    scanUnsupported: '此浏览器不支持镜头扫码，请改用手动输入。',
    markIn: '标记已签到',
    checkedIn: '已签到',
    notChecked: '未签到',
    noRegistrations: '未找到报名纪录。',
    homeShop: '运动用品商店',
    homeEvents: '活动报名',
    homeShopBody: '运动服、团体服与运动用品示例货架。售价待确认。',
    homeEventsBody: '报名后取得参考编号，工作人员可签到。目前为示例活动。',
    allCategories: '全部分类',
    view: '查看',
    back: '返回',
    required: '请填写必填栏位。',
    contactOptional: '邮箱如有填写，只用于这张纪录。',
  },
  en: {
    shop: 'Shop',
    events: 'Events',
    cart: 'Cart',
    pricePending: 'Suggested price to be confirmed',
    stockUnset: 'Stock not set',
    sampleBanner: 'These are sample products so the catalogue, options, and checkout layout can be reviewed. Photos, SKUs, stock, and final prices are not confirmed, and no payment provider is connected.',
    addToCart: 'Add to cart',
    size: 'Size',
    color: 'Colour',
    teamName: 'Team name (optional)',
    teamNameHint: 'Saved on this sample order only. Nothing is sent to production.',
    qty: 'Qty',
    emptyCart: 'Your cart is empty.',
    checkout: 'Checkout',
    continueShop: 'Continue shopping',
    checkoutTitle: 'Sample checkout',
    mockPay: 'This step does not charge a card and is not connected to a payment gateway. Submitting creates a sample order you can view.',
    name: 'Name',
    phone: 'Phone',
    email: 'Email (optional)',
    note: 'Note (optional)',
    placeOrder: 'Place sample order',
    orderTitle: 'Sample order',
    orderMock: 'The order is recorded as an unpaid sample. No payment was taken.',
    eventsBanner: 'These sample activities exercise registration and check-in. Dates, venues, fees, and capacity are not confirmed and are not the official schedule. Live fixtures stay on the Matches page.',
    register: 'Register',
    team: 'Team name',
    ticketTitle: 'Registration confirmed',
    ticketHint: 'Keep the reference or QR code. Staff can scan it or type the reference in the admin check-in desk.',
    ref: 'Reference',
    checkinTitle: 'Event check-in',
    checkinHint: 'Search by reference, name, or team, or scan the registration QR with a browser that supports the camera barcode detector.',
    lookup: 'Search',
    scan: 'Scan with camera',
    scanUnsupported: 'This browser cannot scan with the camera. Enter the reference instead.',
    markIn: 'Mark checked in',
    checkedIn: 'Checked in',
    notChecked: 'Not checked in',
    noRegistrations: 'No registration found.',
    homeShop: 'Sports shop',
    homeEvents: 'Event registration',
    homeShopBody: 'Sample sportswear, team kit, and equipment. Prices are not final.',
    homeEventsBody: 'Register to get a reference staff can check in. Activities shown are samples.',
    allCategories: 'All categories',
    view: 'View',
    back: 'Back',
    required: 'Please fill in the required fields.',
    contactOptional: 'If you add an email, it is stored only on this record.',
  },
};
