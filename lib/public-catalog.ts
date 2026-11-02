import { LEAGUE_EVENTS } from '@/lib/events-catalog';

/** 商店仍為示範貨架，HQ-103 唔對外展示「示例／待確認」內容 */
export const SHOP_SECTION_PUBLIC = false;

/** 只列出已標記 published 的活動（唔顯示 sample 條目） */
export function listPublicEvents() {
  return LEAGUE_EVENTS.filter((event) => event.published === true);
}

export const EVENTS_SECTION_PUBLIC = listPublicEvents().length > 0;
