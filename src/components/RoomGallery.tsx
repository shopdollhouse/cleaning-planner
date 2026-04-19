import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Plus, Trophy, Search, RotateCcw, Layers, Zap, Wrench, Calendar, AlertCircle } from 'lucide-react';
import StuckButton from '@/components/StuckButton';
import { confetti } from '@/lib/confetti-throttled';
import { toast } from 'sonner';
import type { DeepCleanRoom } from '@/data/deepCleanRooms';
import type { DeepCleanTaskState, MaintenanceRecurrence } from '@/hooks/useAppState';

const darkenHSL = (hslString: string): string => {
  const match = hslString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (match) {
    const [, h, s, l] = match;
    return `hsl(${h} ${s}% 45%)`;
  }
  return hslString;
};

const lightenForBackground = (hslString: string): string => {
  const match = hslString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (match) {
    const [, h, s, l] = match;
    return `hsl(${h} ${s}% 70%)`;
  }
  return hslString;
};

interface RoomGalleryProps {
  rooms: DeepCleanRoom[];
  tasks: DeepCleanTaskState;
  onToggle: (roomId: string, taskId: string) => void;
  onAdd: (roomId: string, label: string) => string;
  onDelete: (roomId: string, taskId: string) => void;
  onReset: (roomId: string) => void;
  soundEnabled: boolean;
  maintenanceRecurrence?: Record<string, MaintenanceRecurrence>;
  onCompleteMaintenanceRoom?: (roomId: string) => void;
}

type TabFilter = 'room' | 'challenge' | 'maintenance';

const TABS: { id: TabFilter; label: string; Icon: typeof Layers }[] = [
  { id: 'room',        label: 'Rooms',       Icon: Layers },
  { id: 'challenge',   label: 'Challenges',  Icon: Zap    },
  { id: 'maintenance', label: 'Maintenance', Icon: Wrench },
];

const QUICK_PICKS: Record<string, string[]> = {
  kitchen:      ['Deep clean baseboards', 'Organize pantry', 'Scrub grout', 'Clean behind appliances', 'Degrease range hood'],
  'master-bath':['Scrub grout', 'Clean exhaust fan', 'Descale fixtures', 'Organize under sink', 'Clean grout lines'],
  living:       ['Clean behind furniture', 'Wash curtains', 'Organize bookshelves', 'Clean light fixtures', 'Deep clean baseboards'],
  'master-bed': ['Rotate mattress', 'Organize closet', 'Wash pillows', 'Clean under bed', 'Deep clean baseboards'],
  default:      ['Deep clean baseboards', 'Organize shelves', 'Scrub grout', 'Clean light fixtures', 'Wipe door frames', 'Vacuum vents'],
};

function getDaysUntilDue(recurrence: MaintenanceRecurrence | undefined): number | null {
  if (!recurrence || recurrence.recurrenceType === 'seasonal') return null;

  const intervals = {
    monthly: 30,
    quarterly: 90,
    biannual: 180,
    annual: 365,
  };

  const intervalDays = intervals[recurrence.recurrenceType as keyof typeof intervals];
  if (!intervalDays) return null;

  if (!recurrence.lastCompletedDate) return 0; // overdue (never completed)

  const lastCompleted = new Date(recurrence.lastCompletedDate);
  const dueDate = new Date(lastCompleted.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const now = new Date();

  return Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
}

const CELL_COLORS = [
  'hsl(340 35% 85%)',  // Dusty Rose
  'hsl(350 45% 87%)',  // Light Pink
  'hsl(45 60% 88%)',   // Pale Cream
  'hsl(160 60% 80%)',  // Mint
  'hsl(160 60% 82%)',  // Mint Light
  'hsl(210 50% 85%)',  // Periwinkle Blue
  'hsl(270 35% 85%)',  // Lavender Purple
];

const RoomGallery = ({ rooms, tasks, onToggle, onAdd, onDelete, onReset, soundEnabled, maintenanceRecurrence, onCompleteMaintenanceRoom }: RoomGalleryProps) => {
  const [activeTab, setActiveTab]       = useState<TabFilter>('room');
  const [addingInRoomId, setAddingInRoomId] = useState<string | null>(null);
  const [roomInputStates, setRoomInputStates] = useState<Record<string, { newLabel: string; searchFilter: string }>>({});
  const [dynamicTasks, setDynamicTasks] = useState<Record<string, { id: string; label: string }[]>>({});

  const getRoomInputState = (roomId: string) =>
    roomInputStates[roomId] ?? { newLabel: '', searchFilter: '' };

  const updateRoomInputState = (roomId: string, updates: Partial<{ newLabel: string; searchFilter: string }>) => {
    setRoomInputStates((prev) => ({
      ...prev,
      [roomId]: { ...getRoomInputState(roomId), ...updates },
    }));
  };
  const [celebratingRoom, setCelebrating] = useState<string | null>(null);
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);

  const filteredRooms = rooms.filter((r) => (r.category ?? 'room') === activeTab);

  const getQuickPicks = (roomId: string) => {
    const picks = QUICK_PICKS[roomId] ?? QUICK_PICKS.default;
    const room = rooms.find((r) => r.id === roomId);
    const { searchFilter } = getRoomInputState(roomId);
    const existing = new Set([
      ...(room?.tasks.map((t) => t.label.toLowerCase()) ?? []),
      ...(dynamicTasks[roomId] ?? []).map((t) => t.label.toLowerCase()),
    ]);
    return picks.filter((p) => p.toLowerCase().includes(searchFilter.toLowerCase()) && !existing.has(p.toLowerCase()));
  };

  const handleAdd = (roomId: string, label?: string) => {
    const { newLabel } = getRoomInputState(roomId);
    const text = label ?? newLabel.trim();
    if (!text) return;
    const id = onAdd(roomId, text);
    setDynamicTasks((prev) => ({ ...prev, [roomId]: [...(prev[roomId] ?? []), { id, label: text }] }));
    if (!label) { updateRoomInputState(roomId, { newLabel: '', searchFilter: '' }); setAddingInRoomId(null); }
  };

  const handleDeleteDynamic = (roomId: string, taskId: string) => {
    onDelete(roomId, taskId);
    setDynamicTasks((prev) => ({ ...prev, [roomId]: (prev[roomId] ?? []).filter((t) => t.id !== taskId) }));
  };

  const handleToggle = (roomId: string, taskId: string, wasDone: boolean) => {
    onToggle(roomId, taskId);
    const roomState = tasks[roomId] ?? {};
    const room = rooms.find((r) => r.id === roomId);
    if (room && !wasDone) {
      const all = [
        ...room.tasks,
        ...(dynamicTasks[roomId] ?? []).map((t) => ({ id: t.id, label: t.label })),
      ];
      const nowDone = all.filter((t) => (t.id === taskId ? true : roomState[t.id])).length;
      if (nowDone === all.length && all.length > 0) {
        setCelebrating(roomId);
        confetti({ particleCount: 110, spread: 85, origin: { y: 0.5 }, disableForReducedMotion: true });
        toast.success(`${room.name} complete! 🎉`);
        setTimeout(() => setCelebrating(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          const count  = rooms.filter((r) => (r.category ?? 'room') === id).length;
          const tabAccent = id === 'room' ? 'hsl(210 50% 75%)' : id === 'challenge' ? 'hsl(45 60% 75%)' : 'hsl(270 35% 75%)';
          return (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setAddingInRoomId(null); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all"
              style={active
                ? { background: tabAccent, color: '#2D2D3D', border: `1px solid ${tabAccent}` }
                : { background: 'transparent', color: 'rgba(45, 45, 61, 0.5)', border: '1px solid transparent' }
              }
            >
              <Icon className="w-5 h-5" style={{ color: '#2D2D3D' }} strokeWidth={1.8} />
              {label}
              <span
                className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums"
                style={active
                  ? { background: 'rgba(255,255,255,0.4)', color: '#2D2D3D' }
                  : { background: 'rgba(160, 180, 190, 0.15)', color: 'rgba(45, 45, 61, 0.4)' }
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <StuckButton />
      </div>

      {/* Room grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {filteredRooms.map((room, index) => {
          const RoomIcon = room.icon;
          const roomState = tasks[room.id] ?? {};
          const allTasks = [
            ...room.tasks,
            ...(dynamicTasks[room.id] ?? []).map((t) => ({ id: t.id, label: t.label })),
          ];
          const doneCount  = allTasks.filter((t) => roomState[t.id]).length;
          const totalCount = allTasks.length;
          const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
          const complete   = pct === 100 && totalCount > 0;

          // Use alternating colors from CELL_COLORS
          const accentColor = CELL_COLORS[index % CELL_COLORS.length];
          const roomColors = {
            accent: accentColor,
            icon: 'rgba(200, 180, 210, 0.15)',
            bar: accentColor,
          };

          return (
            <motion.div
              key={room.id}
              layout
              className="rounded-3xl overflow-hidden relative"
              style={{
                backgroundColor: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                border: `1px solid rgba(200, 180, 210, 0.2)`,
                boxShadow: complete ? `0 8px 32px ${roomColors.accent}20` : '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div className="absolute top-0 right-0 h-full w-1" style={{ background: roomColors.accent }} />
              {/* Celebration overlay */}
              <AnimatePresence>
                {celebratingRoom === room.id && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
                    style={{ background: `${roomColors.accent}20`, backdropFilter: 'blur(4px)' }}
                  >
                    <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.6 }} className="text-center">
                      <Trophy className="w-9 h-9 mx-auto mb-1.5" style={{ color: roomColors.accent }} />
                      <p className="text-sm font-display font-bold" style={{ color: roomColors.accent }}>Room Complete!</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Room header bar */}
              <div
                className="px-5 py-4 border-b"
                style={{ borderColor: 'rgba(200, 180, 210, 0.2)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: roomColors.accent, boxShadow: `0 2px 8px ${roomColors.accent}40` }}
                    >
                      <RoomIcon className="w-6 h-6" style={{ color: '#2D2D3D' }} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-display font-semibold leading-tight" style={{ color: '#2D2D3D' }}>
                        {room.name}
                      </p>
                      {(room.category ?? 'room') === 'maintenance' && maintenanceRecurrence ? (
                        (() => {
                          const daysUntil = getDaysUntilDue(maintenanceRecurrence[room.id]);
                          const statusText = daysUntil === null ? '✓ Seasonal' :
                                           daysUntil === 0 ? '⚠️ Overdue' :
                                           daysUntil === 1 ? '📅 Due tomorrow' :
                                           `📅 Due in ${daysUntil}d`;
                          return (
                            <p className="text-xs font-sans mt-0.5" style={{ color: daysUntil === 0 ? '#dc2626' : 'rgb(107, 114, 128)' }}>
                              {statusText}
                            </p>
                          );
                        })()
                      ) : (
                        <p className="text-xs font-sans mt-0.5 text-muted-foreground/70">
                          {complete ? '✓ All done!' : `${doneCount}/${totalCount}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold tabular-nums" style={{ color: darkenHSL(roomColors.accent) }}>
                      {pct}%
                    </span>
                    <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(200, 180, 210, 0.15)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: roomColors.accent }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Task list */}
              <div className="px-5 pt-3 pb-4 space-y-1">
                {allTasks.map((task) => {
                  const isDone    = roomState[task.id] ?? false;
                  const isDynamic = (dynamicTasks[room.id] ?? []).some((t) => t.id === task.id);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-all"
                      style={{ background: isDone ? `${roomColors.accent}10` : 'transparent' }}
                    >
                      <button
                        onClick={() => handleToggle(room.id, task.id, isDone)}
                        className="shrink-0 transition-transform hover:scale-110"
                      >
                        {isDone
                          ? <CheckCircle2 className="w-6 h-6" style={{ color: roomColors.accent }} strokeWidth={1.8} />
                          : <Circle className="w-6 h-6" style={{ color: '#2D2D3D' }} strokeWidth={1.8} />
                        }
                      </button>
                      <span className={`text-sm font-sans flex-1 ${isDone ? 'line-through text-muted-foreground' : 'text-foreground/85'}`}>
                        {task.label}
                      </span>
                      {isDynamic && (
                        <button
                          onClick={() => handleDeleteDynamic(room.id, task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-5 h-5 text-destructive" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add task */}
                <AnimatePresence initial={false} mode="wait">
                  {addingInRoomId === room.id ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="pt-2 space-y-2.5"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: '#2D2D3D' }} strokeWidth={2} />
                        <input
                          autoFocus
                          value={getRoomInputState(room.id).newLabel}
                          onChange={(e) => updateRoomInputState(room.id, { newLabel: e.target.value, searchFilter: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAdd(room.id)}
                          placeholder="Search or type a task…"
                          aria-label={`Search quick picks or type a new task for ${room.name}`}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border font-medium focus:outline-none"
                          style={{ background: `${roomColors.accent}10`, borderColor: `${roomColors.accent}30`, '--tw-ring-color': `${roomColors.accent}30`, color: '#2D2D3D' } as React.CSSProperties}
                        />
                      </div>
                      {getQuickPicks(room.id).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {getQuickPicks(room.id).map((pick) => (
                            <button
                              key={pick}
                              onClick={() => handleAdd(room.id, pick)}
                              className="px-3 py-1.5 text-xs rounded-lg font-semibold transition-all hover:shadow-sm"
                              style={{
                                background: roomColors.icon,
                                color: '#2D2D3D',
                                border: `1px solid ${roomColors.accent}40`,
                                fontWeight: 600
                              }}
                            >
                              + {pick}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAdd(room.id)}
                          className="px-4 py-2 text-xs rounded-lg font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: roomColors.accent }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingInRoomId(null); updateRoomInputState(room.id, { newLabel: '', searchFilter: '' }); }}
                          className="px-4 py-2 text-xs rounded-lg font-semibold transition-colors"
                          style={{
                            background: `${roomColors.accent}12`,
                            color: roomColors.accent,
                            border: `1px solid ${roomColors.accent}30`
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="add-btn"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => { setAddingInRoomId(room.id); updateRoomInputState(room.id, { newLabel: '', searchFilter: '' }); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all mt-1 hover:shadow-md"
                      style={{
                        color: roomColors.accent,
                        background: lightenForBackground(roomColors.accent),
                        border: `1.5px solid ${roomColors.accent}`
                      }}
                    >
                      <Plus className="w-5 h-5" strokeWidth={2.5} /> Add task
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Reset/Complete strip */}
                {(doneCount > 0 || ((room.category ?? 'room') === 'maintenance' && complete)) && (
                  <div className="pt-3 mt-2 border-t" style={{ borderColor: 'rgba(80, 90, 120, 0.2)' }}>
                    <AnimatePresence mode="wait">
                      {confirmResetId === room.id ? (
                        <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-2 pt-2">
                          <span className="text-xs text-muted-foreground/70">
                            {(room.category ?? 'room') === 'maintenance' ? 'Mark as completed?' : `Reset ${doneCount} checked?`}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if ((room.category ?? 'room') === 'maintenance' && onCompleteMaintenanceRoom) {
                                  onCompleteMaintenanceRoom(room.id);
                                  toast.success(`${room.name} marked as complete ✓`);
                                } else {
                                  onReset(room.id);
                                  setDynamicTasks((prev) => { const u = { ...prev }; delete u[room.id]; return u; });
                                  toast.success(`${room.name} reset`);
                                }
                                setConfirmResetId(null);
                              }}
                              className="px-3 py-1 text-xs rounded-lg font-semibold transition-colors"
                              style={{
                                background: (room.category ?? 'room') === 'maintenance' ? 'hsl(160 60% 40% / 0.15)' : 'hsl(0 84% 60% / 0.15)',
                                color: (room.category ?? 'room') === 'maintenance' ? 'hsl(160 100% 35%)' : 'hsl(0 84% 60%)',
                              }}
                            >
                              {(room.category ?? 'room') === 'maintenance' ? 'Mark Complete' : 'Reset'}
                            </button>
                            <button onClick={() => setConfirmResetId(null)} className="px-3 py-1 text-xs rounded-lg transition-colors font-medium" style={{ color: roomColors.accent, background: `${roomColors.accent}10`, border: `1px solid ${roomColors.accent}20` }}>
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="reset-btn"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => setConfirmResetId(room.id)}
                          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-xl transition-all"
                          style={{
                            color: (room.category ?? 'room') === 'maintenance' ? 'hsl(160 100% 35%)' : roomColors.accent,
                            background: (room.category ?? 'room') === 'maintenance' ? 'hsl(160 60% 40% / 0.08)' : `${roomColors.accent}15`,
                            border: (room.category ?? 'room') === 'maintenance' ? 'none' : `1px solid ${roomColors.accent}30`,
                          }}
                        >
                          <Calendar className="w-5 h-5" strokeWidth={2} /> {(room.category ?? 'room') === 'maintenance' ? 'Mark as completed' : 'Reset room'}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(RoomGallery);
