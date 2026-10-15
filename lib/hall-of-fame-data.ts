import hallOfFameJson from '@/data/hall-of-fame.json';

export interface HallPlacement {
  award: string;
  teamName: string;
}

export interface HallIndividualAward {
  award: string;
  teamName: string;
  playerName: string;
  number: string;
}

export interface HallSeason {
  id: string;
  title: string;
  published: boolean;
  placements: HallPlacement[];
  individualAwards: HallIndividualAward[];
}

export interface HallOfFameData {
  seasons: HallSeason[];
}

export function getHallOfFameData(): HallOfFameData {
  return hallOfFameJson as HallOfFameData;
}

/** 個人獎顯示名（三語介面標籤用 key 對應） */
export function hallAwardDisplayKey(award: string): string {
  if (award === '偷波王(抄截王)' || award === '盜球王') return 'steals';
  if (award === '抄截王') return 'steals';
  if (award === '得分王') return 'pts';
  if (award === '籃板王') return 'reb';
  if (award === '助攻王') return 'ast';
  if (award === '封阻王') return 'blk';
  if (award === '三分王') return 'three';
  return award;
}

export function placementMedalClass(award: string): string {
  if (award === '冠軍') return 'bg-amber-400 text-amber-950';
  if (award === '亞軍') return 'bg-gray-300 text-gray-800';
  if (award === '季軍') return 'bg-amber-700 text-white';
  return 'bg-primary/10 text-primary';
}
