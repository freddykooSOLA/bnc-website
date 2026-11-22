import { rosterDeadlinePassed } from '@/lib/team-roster';

type EntryForAccess = {
  status: string;
  rosterUnlocked: boolean;
};

export type RosterLockReason =
  | 'none'
  | 'not_confirmed'
  | 'deadline'
  | 'no_entry';

const STATUS_LABEL: Record<string, string> = {
  submitted: '已提交，待審批',
  paid: '已標記繳費',
  rejected: '未獲接納',
  draft: '草稿',
};

export function rosterEditAccess(entry: EntryForAccess | null, rosterBy: Date | null): {
  editable: boolean;
  reason: RosterLockReason;
  statusLabel: string | null;
} {
  if (!entry || !rosterBy) {
    return { editable: false, reason: 'no_entry', statusLabel: null };
  }
  if (entry.status !== 'confirmed') {
    return {
      editable: false,
      reason: 'not_confirmed',
      statusLabel: STATUS_LABEL[entry.status] ?? entry.status,
    };
  }
  const deadlineOpen = !rosterDeadlinePassed(rosterBy) || entry.rosterUnlocked;
  if (!deadlineOpen) {
    return { editable: false, reason: 'deadline', statusLabel: '名單已截止' };
  }
  return { editable: true, reason: 'none', statusLabel: null };
}