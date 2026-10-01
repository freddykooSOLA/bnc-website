import type { Lang, LocalizedString } from '@/types';

/** 商店分類。沒有真實供應商或品牌，只用來演示貨架結構。 */
export type ShopCategoryId = 'sportswear' | 'uniforms' | 'equipment';

export interface ShopColor {
  id: string;
  label: LocalizedString;
}

export interface ShopProduct {
  slug: string;
  category: ShopCategoryId;
  name: LocalizedString;
  summary: LocalizedString;
  /** 僅作畫面示例，不是確認售價。 */
  samplePriceHkd: number;
  sizes: string[];
  colors: ShopColor[];
  /** 團體服可填隊名，後端只保存文字，不會送去印刷。 */
  teamName: boolean;
}

export const SHOP_CATEGORIES: {
  id: ShopCategoryId;
  name: LocalizedString;
  blurb: LocalizedString;
}[] = [
  {
    id: 'sportswear',
    name: { 'zh-hk': '運動服', 'zh-cn': '运动服', en: 'Sportswear' },
    blurb: {
      'zh-hk': '日常訓練用上衣、短褲及外套示例。',
      'zh-cn': '日常训练用上衣、短裤及外套示例。',
      en: 'Sample training tops, shorts, and jackets.',
    },
  },
  {
    id: 'uniforms',
    name: { 'zh-hk': '團體服 / 隊服', 'zh-cn': '团体服 / 队服', en: 'Team uniforms' },
    blurb: {
      'zh-hk': '可選尺碼、顏色，並可填隊名的示例隊服。印製流程尚未接通。',
      'zh-cn': '可选尺码、颜色，并可填队名的示例队服。印制流程尚未接通。',
      en: 'Sample kit with size, colour, and team-name options. Printing is not connected.',
    },
  },
  {
    id: 'equipment',
    name: { 'zh-hk': '運動用品', 'zh-cn': '运动用品', en: 'Sports equipment' },
    blurb: {
      'zh-hk': '球類及訓練配件示例。沒有真實庫存。',
      'zh-cn': '球类及训练配件示例。没有真实库存。',
      en: 'Sample balls and training accessories. No live stock.',
    },
  },
];

const COLORS: Record<string, ShopColor> = {
  black: { id: 'black', label: { 'zh-hk': '黑色', 'zh-cn': '黑色', en: 'Black' } },
  white: { id: 'white', label: { 'zh-hk': '白色', 'zh-cn': '白色', en: 'White' } },
  orange: { id: 'orange', label: { 'zh-hk': '橙色', 'zh-cn': '橙色', en: 'Orange' } },
  navy: { id: 'navy', label: { 'zh-hk': '深藍', 'zh-cn': '深蓝', en: 'Navy' } },
};

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const APPAREL_COLORS = [COLORS.black, COLORS.white, COLORS.orange, COLORS.navy];

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: 'crew-sport-tee',
    category: 'sportswear',
    name: { 'zh-hk': '圓領運動T恤', 'zh-cn': '圆领运动T恤', en: 'Crew-neck sport tee' },
    summary: {
      'zh-hk': '吸汗圓領短袖示例。照片、布料及最終售價待營運確認後替換。',
      'zh-cn': '吸汗圆领短袖示例。照片、布料及最终售价待营运确认后替换。',
      en: 'Sample moisture-wicking crew tee. Photo, fabric, and final price are still to be confirmed.',
    },
    samplePriceHkd: 180,
    sizes: APPAREL_SIZES,
    colors: APPAREL_COLORS,
    teamName: false,
  },
  {
    slug: 'sport-shorts',
    category: 'sportswear',
    name: { 'zh-hk': '運動短褲', 'zh-cn': '运动短裤', en: 'Sport shorts' },
    summary: {
      'zh-hk': '訓練短褲示例，未對應任何供應商貨號。',
      'zh-cn': '训练短裤示例，未对应任何供应商货号。',
      en: 'Sample training shorts. Not tied to a supplier SKU.',
    },
    samplePriceHkd: 150,
    sizes: APPAREL_SIZES,
    colors: APPAREL_COLORS,
    teamName: false,
  },
  {
    slug: 'zip-track-jacket',
    category: 'sportswear',
    name: { 'zh-hk': '拉鍊運動外套', 'zh-cn': '拉链运动外套', en: 'Zip track jacket' },
    summary: {
      'zh-hk': '熱身外套示例。庫存未設定。',
      'zh-cn': '热身外套示例。库存未设定。',
      en: 'Sample warm-up jacket. Stock is not set.',
    },
    samplePriceHkd: 320,
    sizes: APPAREL_SIZES,
    colors: [COLORS.black, COLORS.navy],
    teamName: false,
  },
  {
    slug: 'team-jersey',
    category: 'uniforms',
    name: { 'zh-hk': '球隊球衣', 'zh-cn': '球队球衣', en: 'Team jersey' },
    summary: {
      'zh-hk': '可填隊名的球衣示例。目前只記錄選項，不會產生印刷訂單。',
      'zh-cn': '可填队名的球衣示例。目前只记录选项，不会产生印刷订单。',
      en: 'Sample jersey with a team-name field. Options are stored only; nothing is sent to print.',
    },
    samplePriceHkd: 220,
    sizes: APPAREL_SIZES,
    colors: APPAREL_COLORS,
    teamName: true,
  },
  {
    slug: 'team-shorts',
    category: 'uniforms',
    name: { 'zh-hk': '球隊球褲', 'zh-cn': '球队球裤', en: 'Team shorts' },
    summary: {
      'zh-hk': '配合球衣的球褲示例，可填隊名。',
      'zh-cn': '配合球衣的球裤示例，可填队名。',
      en: 'Sample shorts meant to match a jersey. Team name is optional.',
    },
    samplePriceHkd: 140,
    sizes: APPAREL_SIZES,
    colors: APPAREL_COLORS,
    teamName: true,
  },
  {
    slug: 'team-kit',
    category: 'uniforms',
    name: { 'zh-hk': '球隊套裝（球衣+球褲）', 'zh-cn': '球队套装（球衣+球裤）', en: 'Team kit (jersey + shorts)' },
    summary: {
      'zh-hk': '一套球衣加球褲的示例組合。價格是占位，不是報價。',
      'zh-cn': '一套球衣加球裤的示例组合。价格是占位，不是报价。',
      en: 'Sample jersey-and-shorts bundle. The price is a placeholder, not a quote.',
    },
    samplePriceHkd: 340,
    sizes: APPAREL_SIZES,
    colors: APPAREL_COLORS,
    teamName: true,
  },
  {
    slug: 'basketball',
    category: 'equipment',
    name: { 'zh-hk': '籃球', 'zh-cn': '篮球', en: 'Basketball' },
    summary: {
      'zh-hk': '室內外通用球示例。尺寸選項只供看結構，品牌未定。',
      'zh-cn': '室内外通用球示例。尺寸选项只供看结构，品牌未定。',
      en: 'Sample indoor/outdoor ball. Size options show the form only. No brand is set.',
    },
    samplePriceHkd: 160,
    sizes: ['5', '6', '7'],
    colors: [COLORS.orange],
    teamName: false,
  },
  {
    slug: 'water-bottle',
    category: 'equipment',
    name: { 'zh-hk': '運動水樽', 'zh-cn': '运动水壶', en: 'Sports water bottle' },
    summary: {
      'zh-hk': '訓練用水樽示例。容量與材質待確認。',
      'zh-cn': '训练用水壶示例。容量与材质待确认。',
      en: 'Sample training bottle. Capacity and material are not confirmed.',
    },
    samplePriceHkd: 80,
    sizes: [],
    colors: [COLORS.black, COLORS.white, COLORS.orange],
    teamName: false,
  },
  {
    slug: 'knee-pads',
    category: 'equipment',
    name: { 'zh-hk': '護膝', 'zh-cn': '护膝', en: 'Knee pads' },
    summary: {
      'zh-hk': '一對護膝示例。尺碼未與供應商對表。',
      'zh-cn': '一对护膝示例。尺码未与供应商对表。',
      en: 'Sample pair of knee pads. Sizes are not mapped to a supplier chart.',
    },
    samplePriceHkd: 90,
    sizes: ['S', 'M', 'L'],
    colors: [COLORS.black],
    teamName: false,
  },
];

export function getCategory(id: string) {
  return SHOP_CATEGORIES.find((category) => category.id === id) || null;
}

export function getProduct(slug: string) {
  return SHOP_PRODUCTS.find((product) => product.slug === slug) || null;
}

export function productsInCategory(id: ShopCategoryId) {
  return SHOP_PRODUCTS.filter((product) => product.category === id);
}

export function samplePriceLabel(lang: Lang, hkd: number) {
  if (lang === 'en') return `Sample HKD ${hkd}`;
  if (lang === 'zh-cn') return `示例 HKD ${hkd}`;
  return `示例 HKD ${hkd}`;
}
