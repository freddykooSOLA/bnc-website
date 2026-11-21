export const ID_PARTIAL_RE = /^[A-Z]{1,2}\d{4}$/;

export interface PlayerRowInput {
  number: number;
  nameZh: string;
  nameEn: string;
  idPartial: string;
  staffId?: string;
  jerseyNumber: number;
}

export interface TeamEntryInput {
  division: string;
  bank: string;
  jerseyColor1: string;
  jerseyColor2: string;
  leaderNameZh: string;
  leaderNameEn: string;
  leaderIdPartial: string;
  leaderEmail: string;
  leaderMobile: string;
  leaderEmergency: string;
  players: PlayerRowInput[];
  declarations: boolean[];
  declarationBank: string;
  declarationSigned: string;
}

export type EntryFieldErrors = Record<string, string>;

export function validateTeamEntryInput(body: unknown): {
  ok: true;
  value: TeamEntryInput;
} | {
  ok: false;
  errors: EntryFieldErrors;
} {
  const errors: EntryFieldErrors = {};
  const data = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const str = (key: string, required = true): string => {
    const v = typeof data[key] === 'string' ? (data[key] as string).trim() : '';
    if (required && !v) errors[key] = 'required';
    return v;
  };

  const value: TeamEntryInput = {
    division: str('division') || '男子组',
    bank: str('bank'),
    jerseyColor1: str('jerseyColor1'),
    jerseyColor2: str('jerseyColor2'),
    leaderNameZh: str('leaderNameZh'),
    leaderNameEn: str('leaderNameEn'),
    leaderIdPartial: str('leaderIdPartial').toUpperCase(),
    leaderEmail: str('leaderEmail'),
    leaderMobile: str('leaderMobile'),
    leaderEmergency: str('leaderEmergency'),
    players: [],
    declarations: [],
    declarationBank: str('declarationBank'),
    declarationSigned: str('declarationSigned'),
  };

  if (value.leaderIdPartial && !ID_PARTIAL_RE.test(value.leaderIdPartial)) {
    errors.leaderIdPartial = 'format';
  }
  if (value.leaderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.leaderEmail)) {
    errors.leaderEmail = 'format';
  }

  const rawPlayers = Array.isArray(data.players) ? data.players : [];
  const players: PlayerRowInput[] = [];
  const jerseySet = new Set<number>();

  rawPlayers.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;
    const r = row as Record<string, unknown>;
    const nameZh = typeof r.nameZh === 'string' ? r.nameZh.trim() : '';
    const nameEn = typeof r.nameEn === 'string' ? r.nameEn.trim() : '';
    const idPartial = typeof r.idPartial === 'string' ? r.idPartial.trim().toUpperCase() : '';
    const staffId = typeof r.staffId === 'string' ? r.staffId.trim() : '';
    const jerseyNumber =
      typeof r.jerseyNumber === 'number'
        ? r.jerseyNumber
        : Number.parseInt(String(r.jerseyNumber ?? ''), 10);
    const number =
      typeof r.number === 'number' ? r.number : Number.parseInt(String(r.number ?? index + 1), 10);

  if (!nameZh && !nameEn) return;

    if (idPartial && !ID_PARTIAL_RE.test(idPartial)) {
      errors[`players.${index}.idPartial`] = 'format';
    }
    if (!Number.isInteger(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) {
      errors[`players.${index}.jerseyNumber`] = 'range';
    } else if (jerseySet.has(jerseyNumber)) {
      errors[`players.${index}.jerseyNumber`] = 'duplicate';
    } else {
      jerseySet.add(jerseyNumber);
    }

    players.push({
      number,
      nameZh,
      nameEn,
      idPartial,
      staffId: staffId || undefined,
      jerseyNumber,
    });
  });

  value.players = players;

  if (players.length < 5 || players.length > 20) {
    errors.players = 'count';
  }

  const rawDecl = Array.isArray(data.declarations) ? data.declarations : [];
  const declarations = [0, 1, 2, 3, 4].map((i) => Boolean(rawDecl[i]));
  value.declarations = declarations;
  if (!declarations.every(Boolean)) {
    errors.declarations = 'all_required';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value };
}