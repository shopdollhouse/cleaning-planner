import { memo, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Plus, Sunrise, Sun, Moon, Focus, Trophy, Search, AlertCircle, Edit2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import type { DailyTask, TimePeriod } from '@/hooks/useAppState';
import { getGentleTimeLabel } from '@/constants/adhd';
import { sanitizeTaskLabel, sanitizeZone } from '@/lib/sanitize';

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

const periodMeta: Record<TimePeriod, {
  label: string;
  icon: typeof Sun;
  bg: string;
  border: string;
  accent: string;
  badgeBg: string;
  barGradient: string;
}> = {
  morning: {
    label: 'Morning Routine',
    icon: Sunrise,
    bg: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    accent: 'hsl(350 45% 87%)',  // Light Pink
    badgeBg: 'hsl(350 45% 95%)',
    barGradient: 'linear-gradient(90deg, hsl(350 45% 85%), hsl(350 35% 75%))',
  },
  afternoon: {
    label: 'Afternoon Tasks',
    icon: Sun,
    bg: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    accent: 'hsl(165 40% 82%)',  // Mint Cyan
    badgeBg: 'hsl(165 40% 90%)',
    barGradient: 'linear-gradient(90deg, hsl(165 40% 80%), hsl(165 30% 70%))',
  },
  evening: {
    label: 'Evening Wind-Down',
    icon: Moon,
    bg: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    accent: 'hsl(270 35% 85%)',  // Lavender Purple
    badgeBg: 'hsl(270 35% 93%)',
    barGradient: 'linear-gradient(90deg, hsl(270 35% 83%), hsl(270 25% 73%))',
  },
};

const QUICK_PICKS = ['Vacuum', 'Dust surfaces', 'Dishes', 'Wipe counters', 'Take out trash', 'Sweep floor', 'Mop floor', 'Tidy up'];

const playCheckSound = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; osc.type = 'sine';
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
  } catch { /* silent */ }
};

function chunkTasks(tasks: DailyTask[]): { label: string; tasks: DailyTask[] }[] {
  if (tasks.length <= 4) return [{ label: '', tasks }];
  const groups: { label: string; tasks: DailyTask[] }[] = [];
  for (let i = 0; i < tasks.length; i += 3) {
    groups.push({ label: `Mini-Win ${groups.length + 1}`, tasks: tasks.slice(i, i + 3) });
  }
  return groups;
}

interface TaskCardProps {
  period: TimePeriod;
  tasks: DailyTask[];
  onToggle: (period: TimePeriod, taskId: string) => void;
  onAdd?: (period: TimePeriod, label: string, zone: string) => void;
  onDelete?: (period: TimePeriod, taskId: string) => void;
  onEdit?: (period: TimePeriod, taskId: string, label: string, zone: string) => void;
  isCurrentFocus?: boolean;
  soundEnabled?: boolean;
  isRestMode?: boolean;
}

const TaskCard = memo(function TaskCard({ period, tasks, onToggle, onAdd, onDelete, onEdit, isCurrentFocus, soundEnabled, isRestMode }: TaskCardProps) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newZone, setNewZone] = useState('');
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const [formErrors, setFormErrors] = useState<{ label?: string; zone?: string }>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editZone, setEditZone] = useState('');
  const [editErrors, setEditErrors] = useState<{ label?: string; zone?: string }>({});

  const meta = periodMeta[period];
  const Icon = meta.icon;
  const completed = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const chunks = useMemo(() => chunkTasks(tasks), [tasks]);

  const filteredQuickPicks = useMemo(() => QUICK_PICKS.filter((p) =>
    p.toLowerCase().includes(searchFilter.toLowerCase()) &&
    !tasks.some((t) => t.label.toLowerCase() === p.toLowerCase())
  ), [searchFilter, tasks]);

  const handleAdd = useCallback((label?: string) => {
    const rawLabel = label || newLabel.trim();
    const rawZone = newZone.trim() || 'General';
    const errors: typeof formErrors = {};

    // Validation
    if (!rawLabel) {
      errors.label = 'Task name is required';
    } else if (rawLabel.length > 100) {
      errors.label = 'Task name must be under 100 characters';
    }

    if (rawZone.length > 50) {
      errors.zone = 'Zone must be under 50 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Cannot add task', { description: Object.values(errors)[0] });
      return;
    }

    if (onAdd) {
      // Sanitize before passing to handler
      const sanitizedLabel = sanitizeTaskLabel(rawLabel);
      const sanitizedZone = sanitizeZone(rawZone);
      onAdd(period, sanitizedLabel, sanitizedZone);
      setNewLabel('');
      setNewZone('');
      setSearchFilter('');
      setFormErrors({});
      if (!label) setAdding(false);
    }
  }, [newLabel, newZone, onAdd, period]);

  const handleEditStart = useCallback((task: DailyTask) => {
    setEditingTaskId(task.id);
    setEditLabel(task.label);
    setEditZone(task.zone);
    setEditErrors({});
  }, []);

  const handleEditSave = useCallback(() => {
    const errors: typeof editErrors = {};

    // Validation
    if (!editLabel.trim()) {
      errors.label = 'Task name is required';
    } else if (editLabel.length > 100) {
      errors.label = 'Task name must be under 100 characters';
    }

    if (editZone.length > 50) {
      errors.zone = 'Zone must be under 50 characters';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      toast.error('Cannot edit task', { description: Object.values(errors)[0] });
      return;
    }

    if (editingTaskId && onEdit) {
      onEdit(period, editingTaskId, editLabel, editZone);
      setEditingTaskId(null);
      setEditLabel('');
      setEditZone('');
      setEditErrors({});
      toast.success('Task updated');
    }
  }, [editLabel, editZone, editingTaskId, onEdit, period]);

  const handleToggle = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      if (soundEnabled) playCheckSound();
    }
    onToggle(period, taskId);

    const newCompleted = task && !task.completed ? completed + 1 : completed - 1;
    if (newCompleted === total && total > 0 && task && !task.completed) {
      setShowComplete(true);
      confetti({ particleCount: 100, spread: 82, origin: { y: 0.5 }, colors: ['hsl(350 45% 87%)', 'hsl(165 40% 82%)', 'hsl(270 35% 85%)', 'hsl(45 60% 88%)'] });
      toast.success('Heroic deed recorded', { description: `${meta.label} — 100% complete.` });
      setTimeout(() => setShowComplete(false), 3000);
    }
  }, [completed, meta.label, onToggle, period, soundEnabled, tasks, total]);

  const isFocusMode = focusTaskId !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-3xl overflow-hidden relative ${isCurrentFocus ? 'ring-2' : ''}`}
      style={{
        backgroundColor: meta.bg,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${meta.border}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        ...(isCurrentFocus ? { ringColor: meta.accent } : {}),
      }}
    >
      <div className="absolute top-0 right-0 h-full w-1" style={{ background: meta.accent }} />
      {/* Section Complete Overlay */}
      <AnimatePresence>
        {showComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm rounded-2xl"
            style={{ backgroundColor: `${meta.bg}cc` }}>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="text-center">
              <Trophy className="w-14 h-14 mx-auto mb-2 text-foreground" strokeWidth={1.5} />
              <p className="text-lg font-display font-bold text-foreground">Section Complete</p>
              <p className="text-sm text-muted-foreground">A heroic deed, beautifully logged.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-110" style={{ backgroundColor: meta.accent, color: '#fff' }}>
              <Icon className="w-5 h-5" style={{ color: 'white' }} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h4 className="text-base font-display font-bold leading-tight text-foreground">{meta.label}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{completed}/{total} completed</p>
            </div>
          </div>
          {completed === total && total > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0">
              <Trophy className="w-5 h-5" style={{ color: meta.accent }} strokeWidth={1.8} />
            </motion.div>
          )}
        </div>
        {/* Progress bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: `${meta.badgeBg}` }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: meta.barGradient }}
          />
        </div>
        <p className="text-xs font-bold mt-2.5 text-right" style={{ color: darkenHSL(meta.accent) }}>{pct}% Progress</p>
      </div>

      {/* Task list */}
      <div className="px-6 pb-4 space-y-5">
        {chunks.map((chunk, ci) => (
          <div key={ci}>
            {chunk.label && (
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <span className="text-[11px] font-display font-bold uppercase tracking-widest" style={{ color: meta.accent }}>{chunk.label}</span>
                <div className="flex-1 h-px" style={{ backgroundColor: meta.border }} />
                <span className="text-[10px] font-semibold text-muted-foreground">{chunk.tasks.filter((t) => t.completed).length}/{chunk.tasks.length}</span>
              </div>
            )}
            <AnimatePresence>
              {chunk.tasks.map((task) => {
                const dimmed = isFocusMode && focusTaskId !== task.id;
                const isEditing = editingTaskId === task.id;
                return (
                  <motion.div key={task.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: dimmed && !isEditing ? 0.15 : 1, x: 0 }} exit={{ opacity: 0, x: 10, height: 0 }} transition={{ duration: 0.3 }}>
                    {isEditing ? (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3.5 rounded-xl space-y-2.5 mb-2.5" style={{ backgroundColor: meta.badgeBg, border: `1px solid ${meta.border}` }}>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Edit task</p>
                        <input value={editLabel} onChange={(e) => { setEditLabel(e.target.value); if (editErrors.label && e.target.value.trim()) setEditErrors(prev => ({ ...prev, label: undefined })); }} placeholder="Task name..." className={`w-full px-3 py-2 text-sm rounded-lg border text-foreground placeholder:text-muted-foreground focus:outline-none ${editErrors.label ? 'border-red-400 bg-red-50/30' : ''}`} style={{ backgroundColor: editErrors.label ? undefined : meta.badgeBg, borderColor: editErrors.label ? '#fc8181' : meta.border }} />
                        {editErrors.label && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="w-4 h-4" strokeWidth={2} />{editErrors.label}</motion.div>}
                        <input value={editZone} onChange={(e) => { setEditZone(e.target.value); if (editErrors.zone && e.target.value.trim()) setEditErrors(prev => ({ ...prev, zone: undefined })); }} placeholder="Zone (optional)..." className={`w-full px-3 py-2 text-sm rounded-lg border text-foreground placeholder:text-muted-foreground focus:outline-none ${editErrors.zone ? 'border-red-400 bg-red-50/30' : ''}`} style={{ backgroundColor: editErrors.zone ? undefined : meta.badgeBg, borderColor: editErrors.zone ? '#fc8181' : meta.border }} />
                        {editErrors.zone && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="w-4 h-4" strokeWidth={2} />{editErrors.zone}</motion.div>}
                        <div className="flex gap-2 pt-1">
                          <button onClick={handleEditSave} className="px-3 py-1.5 text-xs rounded-lg font-medium text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: meta.accent }}>Save</button>
                          <button onClick={() => { setEditingTaskId(null); setEditLabel(''); setEditZone(''); setEditErrors({}); }} className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-muted-foreground" style={{ backgroundColor: meta.badgeBg }}>Cancel</button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-3.5 p-3.5 rounded-xl transition-all group hover:shadow-sm" style={{ backgroundColor: task.completed ? meta.badgeBg : focusTaskId === task.id ? meta.badgeBg : 'transparent', ...(focusTaskId === task.id ? { outline: `2px solid ${meta.border}`, boxShadow: `0 0 0 3px ${meta.accent}10` } : {}) }}>
                        <button onClick={() => handleToggle(task.id)} className="shrink-0 transition-transform hover:scale-110">
                          {task.completed ? <CheckCircle2 className="w-6 h-6" style={{ color: meta.accent }} strokeWidth={2} /> : <Circle className="w-6 h-6 text-foreground" strokeWidth={1.8} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate leading-relaxed ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{getGentleTimeLabel(task)}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">{task.zone}</p>
                        </div>
                        {!isRestMode && (
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => setFocusTaskId(focusTaskId === task.id ? null : task.id)} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: focusTaskId === task.id ? meta.accent : undefined, backgroundColor: focusTaskId === task.id ? `${meta.accent}15` : undefined }} title={focusTaskId === task.id ? 'Exit focus' : 'Focus on this task'}><Focus className={`w-4.5 h-4.5 ${focusTaskId === task.id ? '' : 'text-foreground'}`} style={{ color: focusTaskId === task.id ? meta.accent : undefined }} strokeWidth={2} /></button>
                            {onEdit && <button onClick={() => handleEditStart(task)} className="p-1.5 rounded-lg hover:bg-primary/10 transition-all hover:scale-110" title="Edit task"><Edit2 className="w-4.5 h-4.5 text-foreground" strokeWidth={2} /></button>}
                            {onDelete && <button onClick={() => onDelete(period, task.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-all hover:scale-110"><Trash2 className="w-4.5 h-4.5 text-destructive" strokeWidth={2} /></button>}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}

        {isFocusMode && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setFocusTaskId(null)}
            className="w-full text-center py-2 text-xs font-medium hover:underline"
            style={{ color: meta.accent }}
          >
            Exit Focus Mode
          </motion.button>
        )}

        {!isRestMode && (
          <>
            {adding ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2 space-y-3">
                <div className="relative">
                  <Search className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground" strokeWidth={2} />
                  <input
                    autoFocus value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search common tasks..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border text-foreground placeholder:text-muted-foreground focus:outline-none"
                    style={{ backgroundColor: meta.badgeBg, borderColor: meta.border }}
                  />
                </div>
                {filteredQuickPicks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {filteredQuickPicks.map((pick) => (
                      <button
                        key={pick} onClick={() => handleAdd(pick)}
                        className="px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors text-foreground"
                        style={{
                          backgroundColor: meta.badgeBg,
                          border: `1px solid ${meta.border}`
                        }}
                      >
                        + {pick}
                      </button>
                    ))}
                  </div>
                )}
                <div className="pt-2 space-y-2" style={{ borderTop: `1px solid ${meta.border}` }}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Or add custom</p>
                  <div>
                    <input value={newLabel} onChange={(e) => {
                      setNewLabel(e.target.value);
                      if (formErrors.label && e.target.value.trim()) {
                        setFormErrors(prev => ({ ...prev, label: undefined }));
                      }
                    }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      placeholder="Task name..."
                      aria-label="Task name"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${formErrors.label ? 'border-red-400 bg-red-50/30' : ''}`}
                      style={{ backgroundColor: formErrors.label ? undefined : meta.badgeBg, borderColor: formErrors.label ? '#fc8181' : meta.border }}
                    />
                    {formErrors.label && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 mt-1.5 text-xs text-red-600">
                        <AlertCircle className="w-4 h-4" strokeWidth={2} />
                        {formErrors.label}
                      </motion.div>
                    )}
                  </div>
                  <div>
                    <input value={newZone} onChange={(e) => {
                      setNewZone(e.target.value);
                      if (formErrors.zone && e.target.value.trim()) {
                        setFormErrors(prev => ({ ...prev, zone: undefined }));
                      }
                    }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      placeholder="Zone (optional)..."
                      aria-label="Zone"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${formErrors.zone ? 'border-red-400 bg-red-50/30' : ''}`}
                      style={{ backgroundColor: formErrors.zone ? undefined : meta.badgeBg, borderColor: formErrors.zone ? '#fc8181' : meta.border }}
                    />
                    {formErrors.zone && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 mt-1.5 text-xs text-red-600">
                        <AlertCircle className="w-4 h-4" strokeWidth={2} />
                        {formErrors.zone}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdd()}
                      className="px-4 py-2 text-xs rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: meta.accent }}
                    >Add</button>
                    <button
                      onClick={() => { setAdding(false); setNewLabel(''); setNewZone(''); setSearchFilter(''); }}
                      className="px-4 py-2 text-xs rounded-xl font-medium transition-colors text-muted-foreground"
                      style={{ backgroundColor: meta.badgeBg }}
                    >Cancel</button>
                  </div>
                </div>
              </motion.div>
            ) : onAdd && (
              <button
                onClick={() => setAdding(true)}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-xs font-bold transition-all hover:shadow-md"
                style={{
                  color: meta.accent,
                  backgroundColor: lightenForBackground(meta.accent),
                  border: `1.5px solid ${meta.accent}`
                }}
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} /> Add task
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
});

export default TaskCard;
