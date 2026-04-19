import { useState, useCallback, useEffect, useRef, useMemo, useId } from 'react';
import { APP_NAME, BRAND_LINKS, BRAND_NAME, LEGAL_NOTICE } from '@/config/brand';
import { getDeepCleanRooms } from '@/data/deepCleanRooms';
import { getGentleMinutes, getGentleTimeLabel, getRandomFlourish, TIME_PERIODS_ORDER } from '@/constants/adhd';
import { STORAGE_KEYS, DAYS, ID_PREFIXES } from '@/config/storage';
import { sanitizeNote } from '@/lib/sanitize';

const STORAGE_KEY = STORAGE_KEYS.APP_STATE;
const LAST_ENTRY_KEY = STORAGE_KEYS.LAST_ENTRY;
const LAST_BACKUP_KEY = STORAGE_KEYS.LAST_BACKUP;

export type TimePeriod = 'morning' | 'afternoon' | 'evening';

export interface DailyTask {
  id: string;
  label: string;
  zone: string;
  completed: boolean;
}

export type DailyTasks = Record<TimePeriod, DailyTask[]>;

export interface DeepCleanTaskState {
  [roomId: string]: { [taskId: string]: boolean };
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface FamilyTask {
  id: string;
  label: string;
  assignedTo: string;
  completed: boolean;
}

export type UiMode = 'standard' | 'focus' | 'dopamine' | 'rest';
export type HeroicDeedSource = 'daily' | 'deep-clean' | 'family' | 'challenge' | 'specialty';

export interface RewardVoucher {
  id: string;
  memberId: string;
  memberName: string;
  reward: string;
  earnedAt: string;
  redeemed: boolean;
}

export interface BrainDumpEntry {
  id: string;
  text: string;
  createdAt: string;
}

export interface QuickStartTask {
  id: string;
  period: TimePeriod;
  label: string;
  zone: string;
  minutes: number;
  timeLabel: string;
  pickedAt: string;
}

export interface HeroicDeed {
  id: string;
  label: string;
  zone: string;
  source: HeroicDeedSource;
  completedAt: string;
  flourish: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  tasks: Array<{ label: string; zone: string }>;
  createdAt: string;
}

export interface MaintenanceRecurrence {
  recurrenceType: 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'seasonal';
  lastCompletedDate: string | null;
}

export interface CustomSpecialtyItem {
  id: string;
  category: string; // 'digital-declutter', 'speed-clean', 'move-in-out'
  label: string;
  createdAt: string;
}

export interface AppState {
  day: string;
  soundEnabled: boolean;
  showTips: boolean;
  userName: string;
  uiMode: UiMode;
  useEmoji: boolean;
  zenMode: boolean;
  visualNoiseFilter: boolean;
  dailyTasks: DailyTasks;
  dailyTasksOverrides: Record<string, DailyTasks>;
  deepCleanTasks: DeepCleanTaskState;
  familySize: number;
  familyMembers: FamilyMember[];
  familyTasks: FamilyTask[];
  activeMemberIds: string[];
  vouchers: RewardVoucher[];
  notes: string[];
  brainDump: BrainDumpEntry[];
  challengeDays: Record<number, boolean>;
  specialtyChecked: Record<string, boolean>;
  customSpecialtyItems: CustomSpecialtyItem[];
  streakCount: number;
  lastStreakDate: string;
  totalTasksCompleted: number;
  quickStartTask: QuickStartTask | null;
  heroicDeeds: HeroicDeed[];
  taskTemplates: TaskTemplate[];
  maintenanceRecurrence: Record<string, MaintenanceRecurrence>;
}

const defaultDailyTasks: DailyTasks = {
  morning: [
    { id: 'm1', label: 'Make all beds', zone: 'Bedrooms', completed: false },
    { id: 'm2', label: 'Wipe kitchen counters', zone: 'Kitchen', completed: false },
    { id: 'm3', label: 'Unload dishwasher', zone: 'Kitchen', completed: false },
  ],
  afternoon: [
    { id: 'a1', label: 'Vacuum living areas', zone: 'Living Areas', completed: false },
    { id: 'a2', label: 'Quick bathroom wipe-down', zone: 'Bathrooms', completed: false },
    { id: 'a3', label: 'Wipe dining table', zone: 'Dining Room', completed: false },
  ],
  evening: [
    { id: 'e1', label: 'Load dishwasher', zone: 'Kitchen', completed: false },
    { id: 'e2', label: '10-minute tidy up', zone: 'Living Areas', completed: false },
    { id: 'e3', label: "Prep tomorrow's supplies", zone: 'Utility', completed: false },
  ],
};

const defaultFamilyMembers: FamilyMember[] = [
  { id: 'f1', name: 'Person 1', avatar: 'smile', color: 'hsl(350 45% 75%)' },
  { id: 'f2', name: 'Person 2', avatar: 'zap', color: 'hsl(210 50% 75%)' },
  { id: 'f3', name: 'Person 3', avatar: 'star', color: 'hsl(270 35% 75%)' },
  { id: 'f4', name: 'Person 4', avatar: 'lightbulb', color: 'hsl(165 40% 75%)' },
  { id: 'f5', name: 'Person 5', avatar: 'baby', color: 'hsl(45 60% 75%)' },
  { id: 'f6', name: 'Person 6', avatar: 'dog', color: 'hsl(340 35% 75%)' },
];

const defaultFamilyTasks: FamilyTask[] = [
  { id: 'ft1', label: 'Vacuum living room', assignedTo: 'f1', completed: false },
  { id: 'ft2', label: 'Wash dishes', assignedTo: 'f1', completed: true },
  { id: 'ft3', label: 'Take out trash', assignedTo: 'f2', completed: false },
  { id: 'ft4', label: 'Mop kitchen floor', assignedTo: 'f2', completed: true },
  { id: 'ft5', label: 'Tidy bedroom', assignedTo: 'f3', completed: true },
  { id: 'ft6', label: 'Feed the pets', assignedTo: 'f3', completed: true },
  { id: 'ft7', label: 'Put away toys', assignedTo: 'f4', completed: false },
  { id: 'ft8', label: 'Set the table', assignedTo: 'f4', completed: false },
  { id: 'ft9', label: 'Wipe counters', assignedTo: 'f1', completed: false },
  { id: 'ft10', label: 'Sweep porch', assignedTo: 'f2', completed: false },
];

const defaultMaintenanceRecurrence: Record<string, MaintenanceRecurrence> = {
  'maint-monthly': { recurrenceType: 'monthly', lastCompletedDate: null },
  'maint-quarterly': { recurrenceType: 'quarterly', lastCompletedDate: null },
  'maint-biannual': { recurrenceType: 'biannual', lastCompletedDate: null },
  'maint-annual': { recurrenceType: 'annual', lastCompletedDate: null },
  'maint-seasonal-spring': { recurrenceType: 'seasonal', lastCompletedDate: null },
  'maint-seasonal-fall': { recurrenceType: 'seasonal', lastCompletedDate: null },
};

const VOUCHER_REWARDS = [
  'Winner picks the movie tonight',
  'Skip one chore tomorrow',
  'Choose dinner for the family',
  'First dibs on the comfy couch spot',
  'Control the playlist for the day',
  'One guilt-free dessert',
];

function buildInitialDeepCleanState(): DeepCleanTaskState {
  const rooms = getDeepCleanRooms();
  const s: DeepCleanTaskState = {};
  for (const room of rooms) {
    s[room.id] = {};
    for (const task of room.tasks) s[room.id][task.id] = false;
  }
  return s;
}

function resetDailyTasks(tasks: DailyTasks): DailyTasks {
  const reset: DailyTasks = { morning: [], afternoon: [], evening: [] };
  for (const period of TIME_PERIODS_ORDER) reset[period] = tasks[period].map((t) => ({ ...t, completed: false }));
  return reset;
}

function buildDefaultState(today: string): AppState {
  return {
    day: today,
    soundEnabled: true,
    showTips: true,
    userName: '',
    uiMode: 'standard',
    useEmoji: false,
    zenMode: false,
    visualNoiseFilter: false,
    dailyTasks: defaultDailyTasks,
    dailyTasksOverrides: {},
    deepCleanTasks: buildInitialDeepCleanState(),
    familySize: 4,
    familyMembers: defaultFamilyMembers,
    familyTasks: defaultFamilyTasks,
    activeMemberIds: [],
    vouchers: [],
    notes: ['', '', '', '', '', '', ''],
    brainDump: [],
    challengeDays: {},
    specialtyChecked: {},
    customSpecialtyItems: [],
    streakCount: 0,
    lastStreakDate: '',
    totalTasksCompleted: 0,
    quickStartTask: null,
    heroicDeeds: [],
    taskTemplates: [],
    maintenanceRecurrence: defaultMaintenanceRecurrence,
  };
}

function isValidAppState(obj: any): obj is AppState {
  if (!obj || typeof obj !== 'object') return false;

  // Check required fields exist and have correct types
  const checks = {
    day: typeof obj.day === 'string',
    soundEnabled: typeof obj.soundEnabled === 'boolean',
    showTips: typeof obj.showTips === 'boolean',
    userName: typeof obj.userName === 'string',
    uiMode: ['standard', 'focus', 'dopamine', 'rest'].includes(obj.uiMode),
    useEmoji: typeof obj.useEmoji === 'boolean',
    dailyTasks: obj.dailyTasks && typeof obj.dailyTasks === 'object',
    dailyTasksOverrides: typeof obj.dailyTasksOverrides === 'object',
    deepCleanTasks: obj.deepCleanTasks && typeof obj.deepCleanTasks === 'object',
    familySize: typeof obj.familySize === 'number',
    familyMembers: Array.isArray(obj.familyMembers),
    familyTasks: Array.isArray(obj.familyTasks),
    activeMemberIds: Array.isArray(obj.activeMemberIds),
    vouchers: Array.isArray(obj.vouchers),
    notes: Array.isArray(obj.notes),
    brainDump: Array.isArray(obj.brainDump),
    challengeDays: typeof obj.challengeDays === 'object',
    specialtyChecked: typeof obj.specialtyChecked === 'object',
    customSpecialtyItems: Array.isArray(obj.customSpecialtyItems),
    taskTemplates: Array.isArray(obj.taskTemplates),
    streakCount: typeof obj.streakCount === 'number',
    lastStreakDate: typeof obj.lastStreakDate === 'string',
    totalTasksCompleted: typeof obj.totalTasksCompleted === 'number',
    quickStartTask: obj.quickStartTask === null || typeof obj.quickStartTask === 'object',
    heroicDeeds: Array.isArray(obj.heroicDeeds),
    maintenanceRecurrence: obj.maintenanceRecurrence && typeof obj.maintenanceRecurrence === 'object',
  };

  return Object.values(checks).every(check => check === true);
}

function migrateAvatarIds(familyMembers: FamilyMember[]): FamilyMember[] {
  const avatarMigration: Record<string, string> = {
    'heart': 'smile',
    'crown': 'zap',
    'sparkles': 'star',
  };

  return familyMembers.map(member => ({
    ...member,
    avatar: avatarMigration[member.avatar] || member.avatar,
  }));
}

function isValidISODate(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  } catch {
    return false;
  }
}

function sanitizeDates(state: Partial<AppState>): Partial<AppState> {
  const sanitized = { ...state };

  // Sanitize heroic deeds dates
  if (Array.isArray(state.heroicDeeds)) {
    sanitized.heroicDeeds = state.heroicDeeds.filter(d => isValidISODate(d.completedAt));
  }

  // Sanitize brain dump dates
  if (Array.isArray(state.brainDump)) {
    sanitized.brainDump = state.brainDump.filter(b => isValidISODate(b.createdAt));
  }

  // Sanitize quick start task date
  if (state.quickStartTask && !isValidISODate(state.quickStartTask.pickedAt)) {
    sanitized.quickStartTask = null;
  }

  // Sanitize voucher dates
  if (Array.isArray(state.vouchers)) {
    sanitized.vouchers = state.vouchers.filter(v => isValidISODate(v.earnedAt));
  }

  // Sanitize task template dates
  if (Array.isArray(state.taskTemplates)) {
    sanitized.taskTemplates = state.taskTemplates.filter(t => isValidISODate(t.createdAt));
  }

  // Sanitize custom specialty item dates
  if (Array.isArray(state.customSpecialtyItems)) {
    sanitized.customSpecialtyItems = state.customSpecialtyItems.filter(c => isValidISODate(c.createdAt));
  }

  return sanitized;
}

function normalizeImportedState(parsed: unknown, today: string): { state: AppState; error?: string } {
  const defaults = buildDefaultState(today);

  try {
    const candidate = parsed && typeof parsed === 'object' && 'state' in parsed
      ? (parsed as { state: unknown }).state
      : parsed;

    if (!isValidAppState(candidate)) {
      // Try to salvage what we can
      if (candidate && typeof candidate === 'object') {
        const partial = candidate as Partial<AppState>;
        const sanitized = sanitizeDates(partial);
        const salvaged = {
          ...defaults,
          ...sanitized,
          day: today,
          // Migrate old avatar IDs to new ones
          familyMembers: migrateAvatarIds(partial.familyMembers || defaults.familyMembers),
          // Ensure maintenanceRecurrence exists for backward compatibility
          maintenanceRecurrence: partial.maintenanceRecurrence || defaultMaintenanceRecurrence,
          // Ensure customSpecialtyItems exists for backward compatibility
          customSpecialtyItems: partial.customSpecialtyItems || [],
          // Ensure dailyTasksOverrides exists for backward compatibility
          dailyTasksOverrides: partial.dailyTasksOverrides || {},
          // Ensure taskTemplates exists for backward compatibility
          taskTemplates: Array.isArray(partial.taskTemplates) ? partial.taskTemplates : [],
        };
        return { state: salvaged, error: 'Some data was invalid and reset to defaults' };
      }
      return { state: defaults, error: 'Invalid backup format' };
    }

    const sanitized = sanitizeDates(candidate);
    return { state: { ...sanitized, day: today, familyMembers: migrateAvatarIds(candidate.familyMembers) } };
  } catch (e) {
    return { state: defaults, error: `Import error: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
}

function loadState(today: string): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const result = normalizeImportedState(JSON.parse(raw), today);
      if (result.error) {
        console.warn('[AppState] Data recovery warning:', result.error);
      }
      return result.state;
    }
  } catch (error) {
    console.error('[AppState] Failed to load state from localStorage:', error instanceof Error ? error.message : String(error));
  }
  return buildDefaultState(today);
}

function getCurrentTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function createHeroicDeed(label: string, zone: string, source: HeroicDeedSource): HeroicDeed {
  return {
    id: generateSecureId('deed'),
    label,
    zone,
    source,
    completedAt: new Date().toISOString(),
    flourish: getRandomFlourish(),
  };
}

function addDeed(s: AppState, deed: HeroicDeed): Pick<AppState, 'heroicDeeds'> {
  return { heroicDeeds: [deed, ...s.heroicDeeds].slice(0, 40) };
}

function pickQuickStartFromState(s: AppState): QuickStartTask | null {
  const current = getCurrentTimePeriod();
  const periods = [current, ...TIME_PERIODS_ORDER.filter((period) => period !== current)];
  const candidates = periods.flatMap((period) =>
    s.dailyTasks[period]
      .filter((task) => !task.completed)
      .map((task) => ({ task, period })),
  );
  if (candidates.length === 0) return null;
  const chosen = candidates[secureRandomIndex(candidates.length)];
  return {
    id: chosen.task.id,
    period: chosen.period,
    label: chosen.task.label,
    zone: chosen.task.zone,
    minutes: getGentleMinutes(chosen.task),
    timeLabel: getGentleTimeLabel(chosen.task),
    pickedAt: new Date().toISOString(),
  };
}

// Removed counter-based ID generation in favor of secure crypto IDs
// All IDs now use generateSecureId() for collision resistance across tabs

function generateSecureId(prefix: string): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return prefix + '-' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function secureRandomIndex(length: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % length;
}

export function useAppState() {
  const today = DAYS[new Date().getDay()];
  const [state, setState] = useState<AppState>(() => loadState(today));
  const stateRef = useRef(state);
  const dailyResetDoneRef = useRef(false);
  const maintenanceResetDoneRef = useRef(false);

  // Debounce localStorage writes to prevent quota exceeded errors
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      stateRef.current = state;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('localStorage quota exceeded:', e);
        // Selective cleanup: try to free space before giving up
        if ((e as DOMException)?.code === 22 || (e as DOMException)?.code === 1014) {
          try {
            // Try 1: Clear notes (largest non-critical data)
            const stateWithoutNotes = { ...state, notes: ['', '', '', '', '', '', ''] };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithoutNotes));
            console.warn('Cleared notes to save space. Please backup your data.');
          } catch (e2) {
            try {
              // Try 2: Clear brain dump
              const stateWithoutDump = { ...state, notes: ['', '', '', '', '', '', ''], brainDump: [] };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithoutDump));
              console.warn('Cleared notes and brain dump. Please backup your data.');
            } catch (e3) {
              // Last resort: Clear templates and custom items
              const stateMinimal = { ...state, notes: ['', '', '', '', '', '', ''], brainDump: [], taskTemplates: [], customSpecialtyItems: [] };
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(stateMinimal));
                console.warn('Cleared large data items. Please backup your data immediately.');
              } catch (e4) {
                console.error('Could not save state even after cleanup:', e4);
              }
            }
          }
        }
      }
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  useEffect(() => {
    if (dailyResetDoneRef.current) return;
    dailyResetDoneRef.current = true;

    const lastEntry = localStorage.getItem(LAST_ENTRY_KEY);
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if we need to reset based on actual date comparison, not just time
    let shouldReset = false;
    if (lastEntry) {
      const last = new Date(lastEntry);
      const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const resetTime = new Date(lastDate);
      resetTime.setDate(resetTime.getDate() + 1);
      resetTime.setHours(4, 0, 0, 0);

      // Reset if: current time >= reset time OR current date > last date (handles timezone/system time changes)
      shouldReset = now >= resetTime || currentDate > lastDate;
    } else {
      // First time loading app
      shouldReset = true;
    }

    if (shouldReset) {
      setState((s) => ({
        ...s,
        dailyTasks: resetDailyTasks(s.dailyTasks),
        quickStartTask: null,
        streakCount: Math.min(s.streakCount + 1, 999),
        lastStreakDate: now.toISOString(),
      }));
    }
    localStorage.setItem(LAST_ENTRY_KEY, now.toISOString());
  }, []);

  // Handle maintenance task recurrence resets
  useEffect(() => {
    if (maintenanceResetDoneRef.current) return;
    maintenanceResetDoneRef.current = true;

    setState((s) => {
      const now = new Date();
      const intervals = {
        monthly: 30 * 24 * 60 * 60 * 1000,
        quarterly: 90 * 24 * 60 * 60 * 1000,
        biannual: 180 * 24 * 60 * 60 * 1000,
        annual: 365 * 24 * 60 * 60 * 1000,
      };

      let newDeepCleanTasks = { ...s.deepCleanTasks };
      let hasChanges = false;

      for (const [roomId, recurrence] of Object.entries(s.maintenanceRecurrence)) {
        if (recurrence.recurrenceType === 'seasonal') continue;

        const intervalMs = intervals[recurrence.recurrenceType as keyof typeof intervals];
        if (!intervalMs) continue;

        const lastCompleted = recurrence.lastCompletedDate ? new Date(recurrence.lastCompletedDate) : null;

        if (!lastCompleted || (now.getTime() - lastCompleted.getTime()) >= intervalMs) {
          const roomTasks = s.deepCleanTasks[roomId];
          if (roomTasks) {
            newDeepCleanTasks[roomId] = Object.fromEntries(
              Object.keys(roomTasks).map((k) => [k, false])
            );
            hasChanges = true;
          }
        }
      }

      return hasChanges ? { ...s, deepCleanTasks: newDeepCleanTasks } : s;
    });
  }, []);

  const setDay = useCallback((day: string) => setState((s) => ({ ...s, day, quickStartTask: null })), []);
  const toggleSound = useCallback(() => setState((s) => ({ ...s, soundEnabled: !s.soundEnabled })), []);
  const toggleShowTips = useCallback(() => setState((s) => ({ ...s, showTips: !s.showTips })), []);
  const setUserName = useCallback((userName: string) => setState((s) => ({ ...s, userName })), []);
  const setUiMode = useCallback((mode: UiMode) => setState((s) => ({ ...s, uiMode: mode })), []);
  const toggleUseEmoji = useCallback(() => setState((s) => ({ ...s, useEmoji: !s.useEmoji })), []);

  const createTemplate = useCallback((name: string, description: string, tasks: Array<{ label: string; zone: string }>) => {
    if (!name.trim() || tasks.length === 0) {
      console.error('Template name and tasks are required');
      return;
    }
    const template: TaskTemplate = {
      id: generateSecureId('tmpl'),
      name: name.trim(),
      description: description.trim(),
      tasks: tasks.filter(t => t.label.trim()),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, taskTemplates: [template, ...s.taskTemplates] }));
    return template;
  }, []);

  const loadTemplate = useCallback((templateId: string, period: TimePeriod) => {
    setState((s) => {
      const template = s.taskTemplates.find(t => t.id === templateId);
      if (!template) return s;
      return {
        ...s,
        dailyTasks: {
          ...s.dailyTasks,
          [period]: [
            ...s.dailyTasks[period],
            ...template.tasks.map((t) => ({
              id: generateSecureId('task'),
              label: t.label,
              zone: t.zone,
              completed: false,
            })),
          ],
        },
      };
    });
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    setState((s) => ({ ...s, taskTemplates: s.taskTemplates.filter(t => t.id !== templateId) }));
  }, []);
  const pickRandomDay = useCallback(() => {
    const randomDay = DAYS[secureRandomIndex(7)];
    setState((s) => ({ ...s, day: randomDay, quickStartTask: null }));
  }, []);

  const pickQuickStartTask = useCallback(() => {
    setState((s) => ({ ...s, quickStartTask: pickQuickStartFromState(s) }));
  }, []);

  const clearQuickStartTask = useCallback(() => {
    setState((s) => ({ ...s, quickStartTask: null }));
  }, []);

  const toggleDailyTask = useCallback((period: TimePeriod, taskId: string) => {
    setState((s) => {
      const task = s.dailyTasks[period].find((t) => t.id === taskId);
      if (!task) return s;
      const completing = !task.completed;
      const deed = completing ? createHeroicDeed(task.label, task.zone, 'daily') : null;
      return {
        ...s,
        totalTasksCompleted: Math.max(0, s.totalTasksCompleted + (completing ? 1 : -1)),
        quickStartTask: s.quickStartTask?.id === taskId ? null : s.quickStartTask,
        ...(deed ? addDeed(s, deed) : {}),
        dailyTasks: {
          ...s.dailyTasks,
          [period]: s.dailyTasks[period].map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        },
      };
    });
  }, []);

  const addDailyTask = useCallback((period: TimePeriod, label: string, zone: string) => {
    const id = generateSecureId(ID_PREFIXES.TASK);
    setState((s) => ({
      ...s,
      dailyTasks: {
        ...s.dailyTasks,
        [period]: [...s.dailyTasks[period], { id, label, zone, completed: false }],
      },
    }));
  }, []);

  const deleteDailyTask = useCallback((period: TimePeriod, taskId: string) => {
    setState((s) => ({
      ...s,
      quickStartTask: s.quickStartTask?.id === taskId ? null : s.quickStartTask,
      dailyTasks: {
        ...s.dailyTasks,
        [period]: s.dailyTasks[period].filter((t) => t.id !== taskId),
      },
    }));
  }, []);

  const editDailyTask = useCallback((period: TimePeriod, taskId: string, label: string, zone: string) => {
    setState((s) => ({
      ...s,
      dailyTasks: {
        ...s.dailyTasks,
        [period]: s.dailyTasks[period].map((t) =>
          t.id === taskId ? { ...t, label: label.trim(), zone: zone.trim() } : t
        ),
      },
    }));
  }, []);

  const setDailyTasksForDay = useCallback((dayName: string, tasks: DailyTasks) => {
    setState((s) => ({
      ...s,
      dailyTasksOverrides: {
        ...s.dailyTasksOverrides,
        [dayName]: tasks,
      },
    }));
  }, []);

  const toggleDeepTask = useCallback((roomId: string, taskId: string) => {
    setState((s) => {
      const was = s.deepCleanTasks[roomId]?.[taskId] || false;
      const room = getDeepCleanRooms().find((r) => r.id === roomId);
      const task = room?.tasks.find((t) => t.id === taskId);
      const deed = !was && task ? createHeroicDeed(task.label, room?.name ?? 'Deep Clean', 'deep-clean') : null;
      return {
        ...s,
        totalTasksCompleted: Math.max(0, s.totalTasksCompleted + (was ? -1 : 1)),
        ...(deed ? addDeed(s, deed) : {}),
        deepCleanTasks: {
          ...s.deepCleanTasks,
          [roomId]: { ...s.deepCleanTasks[roomId], [taskId]: !was },
        },
      };
    });
  }, []);

  const addDeepTask = useCallback((roomId: string, label: string) => {
    const id = `dc-${++deepTaskIdCounter}`;
    setState((s) => ({ ...s, deepCleanTasks: { ...s.deepCleanTasks, [roomId]: { ...s.deepCleanTasks[roomId], [id]: false } } }));
    return id;
  }, []);

  const deleteDeepTask = useCallback((roomId: string, taskId: string) => {
    setState((s) => {
      const roomTasks = { ...s.deepCleanTasks[roomId] };
      delete roomTasks[taskId];
      return { ...s, deepCleanTasks: { ...s.deepCleanTasks, [roomId]: roomTasks } };
    });
  }, []);

  const resetDeepRoom = useCallback((roomId: string) => {
    setState((s) => {
      const roomState = s.deepCleanTasks[roomId] || {};
      const completedCount = Object.values(roomState).filter(Boolean).length;
      const resetRoom = Object.fromEntries(Object.keys(roomState).map((k) => [k, false]));
      return {
        ...s,
        totalTasksCompleted: Math.max(0, s.totalTasksCompleted - completedCount),
        deepCleanTasks: { ...s.deepCleanTasks, [roomId]: resetRoom },
      };
    });
  }, []);

  const completeMaintenanceRoom = useCallback((roomId: string) => {
    setState((s) => ({
      ...s,
      maintenanceRecurrence: {
        ...s.maintenanceRecurrence,
        [roomId]: {
          ...s.maintenanceRecurrence[roomId],
          lastCompletedDate: new Date().toISOString(),
        },
      },
    }));
  }, []);

  const setFamilySize = useCallback((size: number) => setState((s) => ({ ...s, familySize: size })), []);

  const toggleFamilyTask = useCallback((taskId: string) => {
    setState((s) => {
      const task = s.familyTasks.find((t) => t.id === taskId);
      if (!task) return s;
      const completing = !task.completed;
      const member = s.familyMembers.find((m) => m.id === task.assignedTo);
      const deed = completing ? createHeroicDeed(task.label, member?.name ?? 'Family Hub', 'family') : null;
      return {
        ...s,
        totalTasksCompleted: Math.max(0, s.totalTasksCompleted + (completing ? 1 : -1)),
        ...(deed ? addDeed(s, deed) : {}),
        familyTasks: s.familyTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
      };
    });
  }, []);

  const updateFamilyMember = useCallback((memberId: string, updates: Partial<FamilyMember>) => {
    setState((s) => ({ ...s, familyMembers: s.familyMembers.map((m) => (m.id === memberId ? { ...m, ...updates } : m)) }));
  }, []);

  const toggleActiveMember = useCallback((memberId: string) => {
    setState((s) => ({
      ...s,
      activeMemberIds: s.activeMemberIds.includes(memberId)
        ? s.activeMemberIds.filter((id) => id !== memberId)
        : [...s.activeMemberIds, memberId],
    }));
  }, []);

  const addFamilyTask = useCallback((memberId: string, label: string) => {
    const id = generateSecureId('ft');
    setState((s) => ({
      ...s,
      familyTasks: [...s.familyTasks, { id, label, assignedTo: memberId, completed: false }],
    }));
  }, []);

  const deleteFamilyTask = useCallback((taskId: string) => {
    setState((s) => ({
      ...s,
      familyTasks: s.familyTasks.filter((t) => t.id !== taskId),
    }));
  }, []);

  const swapTasks = useCallback((taskAId: string, taskBId: string) => {
    setState((s) => {
      const a = s.familyTasks.find((t) => t.id === taskAId);
      const b = s.familyTasks.find((t) => t.id === taskBId);
      if (!a || !b) return s;
      return {
        ...s,
        familyTasks: s.familyTasks.map((t) => {
          if (t.id === taskAId) return { ...t, assignedTo: b.assignedTo };
          if (t.id === taskBId) return { ...t, assignedTo: a.assignedTo };
          return t;
        }),
      };
    });
  }, []);

  const issueVoucher = useCallback((memberId: string, memberName: string) => {
    const reward = VOUCHER_REWARDS[secureRandomIndex(VOUCHER_REWARDS.length)];
    const voucher: RewardVoucher = {
      id: generateSecureId('v'),
      memberId,
      memberName,
      reward,
      earnedAt: new Date().toISOString(),
      redeemed: false,
    };
    setState((s) => ({ ...s, vouchers: [voucher, ...s.vouchers] }));
    return voucher;
  }, []);

  const redeemVoucher = useCallback((voucherId: string) => {
    setState((s) => ({ ...s, vouchers: s.vouchers.map((v) => (v.id === voucherId ? { ...v, redeemed: true } : v)) }));
  }, []);

  const deleteVoucher = useCallback((voucherId: string) => {
    setState((s) => ({ ...s, vouchers: s.vouchers.filter((v) => v.id !== voucherId) }));
  }, []);

  const toggleChallengeDay = useCallback((day: number) => {
    setState((s) => {
      const was = s.challengeDays[day] || false;
      const deed = !was ? createHeroicDeed(`Day ${day} challenge`, '30-Day Challenge', 'challenge') : null;
      return {
        ...s,
        totalTasksCompleted: Math.max(0, s.totalTasksCompleted + (was ? -1 : 1)),
        ...(deed ? addDeed(s, deed) : {}),
        challengeDays: { ...s.challengeDays, [day]: !was },
      };
    });
  }, []);

  const toggleSpecialtyItem = useCallback((id: string) => {
    setState((s) => {
      const was = s.specialtyChecked[id] || false;
      const deed = !was ? createHeroicDeed('Specialty checklist item', 'Specialty', 'specialty') : null;
      return {
        ...s,
        totalTasksCompleted: Math.max(0, s.totalTasksCompleted + (was ? -1 : 1)),
        ...(deed ? addDeed(s, deed) : {}),
        specialtyChecked: { ...s.specialtyChecked, [id]: !was },
      };
    });
  }, []);

  const addCustomSpecialtyItem = useCallback((category: string, label: string) => {
    const trimmed = label.trim();

    // Validate inputs
    if (!trimmed || !category) return;
    if (trimmed.length > 100) return; // Prevent excessively long items

    const validCategories = ['digital-declutter', 'speed-clean', 'move-in-out'];
    if (!validCategories.includes(category)) return; // Validate category

    setState((s) => {
      // Check for duplicates
      const isDuplicate = s.customSpecialtyItems.some(
        (item) => item.category === category && item.label.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) return s;

      return {
        ...s,
        customSpecialtyItems: [
          ...s.customSpecialtyItems,
          {
            id: generateSecureId(ID_PREFIXES.CUSTOM_SPECIALTY),
            category,
            label: trimmed,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  }, []);

  const deleteCustomSpecialtyItem = useCallback((itemId: string) => {
    setState((s) => ({
      ...s,
      customSpecialtyItems: s.customSpecialtyItems.filter((item) => item.id !== itemId),
      // Also remove from checked state
      specialtyChecked: Object.fromEntries(
        Object.entries(s.specialtyChecked).filter(([key]) => key !== itemId)
      ),
    }));
  }, []);

  const updateNote = useCallback((index: number, value: string) => {
    const sanitized = sanitizeNote(value);
    setState((s) => {
      const newNotes = [...s.notes];
      newNotes[index] = sanitized;
      return { ...s, notes: newNotes };
    });
  }, []);

  const addBrainDump = useCallback((text: string) => {
    const sanitized = sanitizeNote(text).trim();
    if (!sanitized) return;
    setState((s) => ({
      ...s,
      brainDump: [{ id: generateSecureId('bd'), text: sanitized, createdAt: new Date().toISOString() }, ...s.brainDump],
    }));
  }, []);

  const deleteBrainDump = useCallback((id: string) => {
    setState((s) => ({ ...s, brainDump: s.brainDump.filter((b) => b.id !== id) }));
  }, []);

  const clearBrainDump = useCallback(() => setState((s) => ({ ...s, brainDump: [] })), []);

  const backup = useCallback(() => {
    const data = JSON.stringify({ app: APP_NAME, brand: BRAND_NAME, version: 2, exportedAt: new Date().toISOString(), legalNotice: LEGAL_NOTICE, officialLinks: BRAND_LINKS, state: stateRef.current }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dollhouse-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const restore = useCallback((file: File) => {
    const reader = new FileReader();
    const abortController = new AbortController();

    // Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      window.dispatchEvent(new CustomEvent('restore-complete', {
        detail: { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.` }
      }));
      return () => abortController.abort();
    }

    reader.onload = (e) => {
      if (abortController.signal.aborted) return;
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const currentDay = DAYS[new Date().getDay()];
        const result = normalizeImportedState(parsed, currentDay);
        setState(result.state);
        window.dispatchEvent(new CustomEvent('restore-complete', { detail: { error: result.error } }));
      } catch (err) {
        window.dispatchEvent(new CustomEvent('restore-complete', {
          detail: { error: `Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}` }
        }));
      }
    };

    reader.onerror = () => {
      if (!abortController.signal.aborted) {
        window.dispatchEvent(new CustomEvent('restore-complete', {
          detail: { error: 'Failed to read file' }
        }));
      }
    };

    reader.readAsText(file);

    return () => {
      abortController.abort();
    };
  }, []);

  const factoryReset = useCallback(() => {
    setState(buildDefaultState(today));
    localStorage.removeItem(LAST_ENTRY_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }, [today]);

  const actions = useMemo(
    () => ({
      taskActions: {
        toggleDailyTask,
        addDailyTask,
        deleteDailyTask,
        editDailyTask,
        setDailyTasksForDay,
        pickQuickStartTask,
        clearQuickStartTask,
      },
      deepCleanActions: {
        toggleDeepTask,
        addDeepTask,
        deleteDeepTask,
        completeMaintenanceRoom,
      },
      familyActions: {
        setFamilySize,
        toggleFamilyTask,
        addFamilyTask,
        deleteFamilyTask,
        updateFamilyMember,
        toggleActiveMember,
        swapTasks,
        issueVoucher,
        redeemVoucher,
        deleteVoucher,
      },
      challengeActions: {
        toggleChallengeDay,
        toggleSpecialtyItem,
        addCustomSpecialtyItem,
        deleteCustomSpecialtyItem,
      },
      noteActions: {
        updateNote,
        addBrainDump,
        deleteBrainDump,
        clearBrainDump,
      },
      brandActions: {
        setUserName,
        setUiMode,
        toggleSound,
        toggleShowTips,
        toggleUseEmoji,
      },
      dataActions: {
        backup,
        restore,
        factoryReset,
      },
      navigationActions: {
        setDay,
        pickRandomDay,
      },
    }),
    [
      toggleDailyTask,
      addDailyTask,
      deleteDailyTask,
      editDailyTask,
      setDailyTasksForDay,
      pickQuickStartTask,
      clearQuickStartTask,
      toggleDeepTask,
      addDeepTask,
      deleteDeepTask,
      completeMaintenanceRoom,
      setFamilySize,
      toggleFamilyTask,
      addFamilyTask,
      deleteFamilyTask,
      updateFamilyMember,
      toggleActiveMember,
      swapTasks,
      issueVoucher,
      redeemVoucher,
      deleteVoucher,
      toggleChallengeDay,
      toggleSpecialtyItem,
      addCustomSpecialtyItem,
      deleteCustomSpecialtyItem,
      updateNote,
      addBrainDump,
      deleteBrainDump,
      clearBrainDump,
      setUserName,
      setUiMode,
      toggleSound,
      toggleShowTips,
      toggleUseEmoji,
      backup,
      restore,
      factoryReset,
      setDay,
      pickRandomDay,
    ],
  );

  return {
    state,
    actions,
    setDay, toggleSound, toggleShowTips, toggleUseEmoji, setUserName, pickRandomDay, setUiMode,
    pickQuickStartTask, clearQuickStartTask,
    toggleDailyTask, addDailyTask, deleteDailyTask, editDailyTask,
    toggleDeepTask, addDeepTask, deleteDeepTask, resetDeepRoom, completeMaintenanceRoom,
    setFamilySize, toggleFamilyTask, addFamilyTask, deleteFamilyTask, updateFamilyMember,
    toggleActiveMember, swapTasks, issueVoucher, redeemVoucher, deleteVoucher,
    toggleChallengeDay, toggleSpecialtyItem, addCustomSpecialtyItem, deleteCustomSpecialtyItem,
    updateNote, addBrainDump, deleteBrainDump, clearBrainDump,
    backup, restore, factoryReset,
    createTemplate, loadTemplate, deleteTemplate,
  };
}
