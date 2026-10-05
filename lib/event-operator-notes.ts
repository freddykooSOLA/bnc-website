import fs from 'fs';
import path from 'path';
import type { Lang, LocalizedString } from '@/types';

const NOTES_PATH = path.join(process.cwd(), 'data', 'event-operator-notes.json');
const RUNTIME_OVERRIDE_PATH = path.join(process.cwd(), 'data', 'runtime', 'event-operator-notes.json');

type NotesFile = Record<string, Partial<LocalizedString>>;

function readNotesFile(): NotesFile {
  const paths = [RUNTIME_OVERRIDE_PATH, NOTES_PATH];
  for (const filePath of paths) {
    try {
      if (!fs.existsSync(filePath)) continue;
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as NotesFile;
    } catch {
      // try next path
    }
  }
  return {};
}

/** Admin-editable session notes (data/runtime/event-operator-notes.json overrides catalog defaults). */
export function getEventOperatorNote(
  slug: string,
  fallback?: LocalizedString
): LocalizedString | null {
  const override = readNotesFile()[slug];
  if (!override && !fallback) return null;
  const langs: Lang[] = ['zh-hk', 'zh-cn', 'en'];
  const merged: LocalizedString = {
    'zh-hk': '',
    'zh-cn': '',
    en: '',
  };
  let hasContent = false;
  for (const lang of langs) {
    const value = override?.[lang] ?? fallback?.[lang] ?? '';
    merged[lang] = value;
    if (value.trim()) hasContent = true;
  }
  return hasContent ? merged : null;
}
