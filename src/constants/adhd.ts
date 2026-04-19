import type { DailyTask } from '@/hooks/useAppState';

export const TIME_PERIODS_ORDER = ['morning', 'afternoon', 'evening'] as const;

export const TASK_TIME_HINTS = [
  { match: ['make all beds', 'prep', 'set the table'], minutes: 4, label: 'one tiny reset' },
  { match: ['wipe', 'dust', 'polish', 'mirror', 'counter'], minutes: 6, label: 'a soft surface polish' },
  { match: ['dishes', 'dishwasher', 'load', 'unload'], minutes: 7, label: 'one kitchen loop' },
  { match: ['vacuum', 'sweep', 'mop'], minutes: 10, label: 'a floor glow-up' },
  { match: ['organize', 'declutter', 'sort', 'closet', 'drawer'], minutes: 12, label: 'a gentle reset' },
  { match: ['deep', 'scrub', 'oven', 'grout', 'shampoo'], minutes: 18, label: 'a luxe deep-clean pass' },
] as const;

export const HEROIC_FLOURISHES = [
  'A small corner of the house exhaled.',
  'Evidence of care, beautifully logged.',
  'A quiet win with champagne energy.',
  'The room is lighter because you began.',
  'Momentum has entered the dollhouse.',
  'A heroic deed, not a moral obligation.',
] as const;

export function getGentleMinutes(task: Pick<DailyTask, 'label'>): number {
  const label = task.label.toLowerCase();
  const match = TASK_TIME_HINTS.find((hint) => hint.match.some((word) => label.includes(word)));
  return match?.minutes ?? 8;
}

export function getGentleTimeLabel(task: Pick<DailyTask, 'label'>): string {
  const minutes = getGentleMinutes(task);
  if (minutes <= 5) return 'Tiny start · about 5 minutes';
  if (minutes <= 8) return 'Short ritual · about 8 minutes';
  if (minutes <= 12) return 'Gentle reset · about 10 minutes';
  return 'Deep sparkle · about 15–20 minutes';
}

export function getRandomFlourish(): string {
  const arr = new Uint8Array(1);
  crypto.getRandomValues(arr);
  return HEROIC_FLOURISHES[arr[0] % HEROIC_FLOURISHES.length];
}
