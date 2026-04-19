import { memo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Lightbulb, User, Download, Upload, RotateCcw, Clock, ChevronDown, HelpCircle, FileText, Printer, Globe, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { AppState } from '@/hooks/useAppState';
import ConfirmModal from '@/components/ConfirmModal';
import { exportStateAsJson, exportPrintablePdf } from '@/lib/exporters';
import { playClick } from '@/lib/sound';

interface SettingsPanelProps {
  state: AppState;
  onSetUserName: (name: string) => void;
  onToggleTips: () => void;
  onToggleUseEmoji: () => void;
  onRestore: (file: File) => void;
  onReset: () => void;
  onToggleSound: () => void;
  onSetDay: (day: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FAQ_ITEMS = [
  { id: 'faq-getting-started', q: 'How do I get started?', a: 'A welcome guide automatically appears on your first visit, showing you the main features. Start with Daily Routines to build momentum, set a 5-minute timer, and celebrate your first win. Everything else builds from there.' },
  { id: 'faq-fresh-start', q: 'How does the Daily Reset work?', a: 'All daily tasks automatically uncheck at 4 AM your local time every single day. Every morning is a clean slate — no guilt from yesterday. Perfect for ADHD brains that struggle with "falling behind." Your custom tasks stay; only the checkmarks clear.' },
  { id: 'faq-dopamine-timer', q: 'What is the Gentle Focus Timer?', a: 'A focus timer with 5–25 minute presets (1m, 5m, 10m, 15m, 20m, 25m) designed to beat "Task Paralysis." Pick ONE task, start the timer, watch the progress ring fill. When the timer ends, a gentle sound signals "done." Small wins stack up fast.' },
  { id: 'faq-timer-location', q: 'Where is the timer?', a: 'The Gentle Focus Timer is in the header (top right) and also in the sidebar when expanded. You can start, pause, and reset it from either location. The header version is always visible; the sidebar version gives you more control.' },
  { id: 'faq-daily-routines', q: 'What are Daily Routines?', a: 'Quick, bite-sized morning, afternoon, and evening tasks designed to build momentum and keep your space livable. Each period has its own set of tasks. Check them off, watch your progress bar fill, and celebrate the win. Tasks reset daily at 4 AM.' },
  { id: 'faq-deep-clean', q: 'How does Deep Clean work?', a: 'Pick ONE room from 22 options, organized into Rooms, Challenges, and Maintenance tiers. Tasks are grouped into "Mini-Wins" (3 tasks max). Use the timer for 5-minute burst sessions. Add custom tasks if your room needs something specific.' },
  { id: 'faq-family-assignments', q: 'How do I use Family Hub?', a: 'Go to Family Hub, set your family size, customize each member with personality avatars (Man, Woman, Child, Baby, Pets), then assign tasks from Daily Routines and Deep Clean. The leaderboard tracks who\'s winning, and the Champion Crown rotates weekly.' },
  { id: 'faq-brain-dump', q: 'What is the Brain Dump?', a: 'Got a distracting thought mid-clean? Capture it in the Brain Dump sticky note so your brain can let it go and refocus. It\'s the ADHD executive function superpower — offload intrusive thoughts without losing momentum on your current task.' },
  { id: 'faq-sticky-notes', q: 'What are the 7 Sticky Notes for?', a: 'Brain Dump (thoughts), Shopping List, Meal Plan, Weekly Goals, Reminders, Cleaning Notes, and Free Page. Each is color-coded and auto-saves as you type. Use them to offload ideas and planning from your working memory.' },
  { id: 'faq-modes', q: 'What do the UI Modes do?', a: 'Standard = balanced, friendly view. Focus = dim distractions for deep work. Dopamine = maximum sparkle, colors, and rewards. Rest = gentle, calming mode for low-energy days. Switch anytime depending on your energy level and mood.' },
  { id: 'faq-focus-filters', q: 'What do Filter and Dim (Visual Breath) do?', a: 'Filter reduces visual noise for better focus by toning down colors. Dim darkens everything except your current task to minimize overwhelm. Toggle either anytime from the header to reduce sensory overload and hyperfocus.' },
  { id: 'faq-30day', q: 'What is the 30-Day Challenge?', a: 'A streak tracker where you check off one task each day for 30 days straight. It\'s motivational gamification for ADHD brains — tracking streaks releases dopamine. Miss a day? No shame, just reset and start again. Progress > Perfection.' },
  { id: 'faq-specialty', q: 'What are Specialty Checklists?', a: 'Three power modes: Digital Decluttering (for your devices), Speed Cleaning (10 and 20 minute versions for quick blitzes), and Move-In/Out (for life transitions). Each has its own progress tracker. Speed Clean works amazingly well before guests arrive!' },
  { id: 'faq-backups', q: 'How do I back up my data?', a: 'Go to Settings → Data → Export JSON Backup. Your data downloads as a JSON file you can re-import on any device. Back up weekly — it takes 2 seconds and saves you from losing progress, custom tasks, and family setup.' },
  { id: 'faq-pdf', q: 'Can I print a checklist?', a: 'Yes! Under Settings → Data, use the PDF buttons to export Daily Routines, Deep Clean, 30-Day Challenge, or Full Planner as PDFs. They open in a new tab ready to print and post on the fridge or share with family.' },
  { id: 'faq-storage', q: 'Is my data stored online?', a: 'No. Everything stays in your browser locally on your device. This means your planner is private and works offline. To sync across devices, use JSON Backup to download and re-import your data yourself.' },
  { id: 'faq-reset', q: 'What does Factory Reset do?', a: 'Factory Reset erases everything and starts you completely fresh — all tasks, notes, family setup, and progress. Consider exporting a JSON backup first if you think you might want your data back. When in doubt, back up!' },
  { id: 'faq-custom-tasks', q: 'Can I add my own tasks?', a: 'Yes! Most sections have a + button to add custom tasks. Your custom tasks appear alongside the defaults and save automatically. They won\'t reset unless you delete them or factory reset.' },
  { id: 'faq-sound-effects', q: 'Can I turn off sound effects?', a: 'Yes. Go to Settings → Preferences, or click the volume icon in the sidebar. A soft chime plays when you complete tasks (if enabled). Some people find it motivating; others prefer silence — your choice!' },
  { id: 'faq-theme', q: 'Can I use dark mode?', a: 'Yes! Go to Settings → Preferences and select Dark Mode. You can also choose Auto (matches your device settings). The app redesigns itself to work beautifully in both light and dark themes.' },
];


type ResetTarget = null | 'reset';

const SettingsPanel = memo(function SettingsPanel({ state, onSetUserName, onToggleTips, onToggleUseEmoji, onRestore, onReset, onToggleSound, onSetDay }: SettingsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmTarget, setConfirmTarget] = useState<ResetTarget>(null);
  const [lastBackedUp, setLastBackedUp] = useState<string | null>(() => typeof window === 'undefined' ? null : localStorage.getItem('dollhouse_lastBackup'));
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);
  const [storageUsage, setStorageUsage] = useState<{ used: number; total: number } | null>(null);

  // Check localStorage quota
  useEffect(() => {
    const abortController = new AbortController();

    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        if (!abortController.signal.aborted) {
          setStorageUsage({ used: usage || 0, total: quota || 0 });
        }
      }).catch(() => {
        if (!abortController.signal.aborted) {
          setStorageUsage({ used: 0, total: 5242880 });
        }
      });
    }

    return () => abortController.abort();
  }, []);

  // Listen for restore completion events
  useEffect(() => {
    const handleRestore = (e: Event) => {
      const event = e as CustomEvent<{ error?: string }>;
      const error = event.detail.error;
      if (error) {
        toast.error(error, { description: 'Some data may have been reset to defaults' });
      } else {
        toast.success('Backup restored successfully!');
      }
    };

    window.addEventListener('restore-complete', handleRestore);
    return () => window.removeEventListener('restore-complete', handleRestore);
  }, []);

  const handleBackupJson = () => {
    try {
      playClick(state.soundEnabled);
      // Check quota before attempting export
      if (storageUsage && storageUsage.used > storageUsage.total * 0.9) {
        toast.error('Storage nearly full', { description: 'Please clear some data before backing up' });
        return;
      }
      exportStateAsJson(state);
      const now = new Date().toLocaleString();
      setLastBackedUp(now);
      localStorage.setItem('dollhouse_lastBackup', now);
      toast.success('Backup created successfully!');
    } catch (err) {
      console.error('Backup failed:', err);
      toast.error('Backup failed', { description: err instanceof Error ? err.message : 'Please try again' });
    }
  };

  const handleExportPdf = (scope: 'daily' | 'deepclean' | 'challenge' | 'all') => {
    try {
      playClick(state.soundEnabled);
      exportPrintablePdf({ state, scope });
      toast.success('PDF opened in new tab');
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('PDF export failed', { description: err instanceof Error ? err.message : 'Please try again' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large', { description: 'Backup must be smaller than 2MB' });
      return;
    }

    onRestore(file);
    // Reset input so same file can be selected again
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <SectionCard accent="blush" icon={User} title="Profile">
        <label className="text-[10px] uppercase tracking-[0.22em] font-sans block mb-2 text-muted-foreground">Display Name</label>
        <input value={state.userName} onChange={(e) => onSetUserName(e.target.value)} placeholder="Enter your name…"
          className="w-full px-3 py-2.5 text-sm font-sans rounded-lg border border-white/40 bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground" />
      </SectionCard>

      <SectionCard accent="lavender" title="Preferences">
        <div className="space-y-4">
          <ToggleRow label="Sound Effects" sub="Play a soft chime on task completion" icon={state.soundEnabled ? Volume2 : VolumeX} on={state.soundEnabled} onToggle={onToggleSound} />
          <ToggleRow label="Daily Tips" sub="Show cleaning tips in welcome card" icon={Lightbulb} on={state.showTips} onToggle={onToggleTips} />
          <ToggleRow label="Emoji Icons" sub="Replace SVG icons with matching emoji" icon={Sparkles} on={state.useEmoji} onToggle={onToggleUseEmoji} />
          <div className="pt-1">
            <p className="text-sm font-sans font-semibold mb-1 text-foreground">Current Day</p>
            <p className="text-xs font-sans mb-3 text-muted-foreground">Override the active day</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const active = state.day === day;
                return (
                  <button key={day} onClick={() => { playClick(state.soundEnabled); onSetDay(day); }}
                    className="px-3 py-1.5 text-xs rounded-lg font-bold font-sans transition-all"
                    style={{ color: active ? '#2D2D3D' : 'hsl(225 20% 30%)', background: active ? 'linear-gradient(135deg, hsl(45 60% 75%), hsl(350 45% 75%))' : 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)' }}>
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard accent="mint" icon={Globe} title="Time Zone">
        <div className="space-y-3">
          <p className="text-xs font-sans text-muted-foreground mb-2">Daily tasks reset at 4 AM your local time</p>
          <p className="text-sm font-sans font-semibold text-foreground">Current Timezone</p>
          <div className="p-3 rounded-lg bg-white/20 border border-white/40">
            <p className="text-sm font-sans text-foreground">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            <p className="text-xs font-sans text-muted-foreground mt-1">Detected from your device settings</p>
          </div>
          {storageUsage && (
            <div className="pt-2 border-t border-white/30">
              <p className="text-xs font-sans font-semibold text-muted-foreground mb-2">Storage Usage</p>
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className={`h-full transition-all ${(storageUsage.used / storageUsage.total) > 0.9 ? 'bg-red-400' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, (storageUsage.used / storageUsage.total) * 100)}%` }}
                  />
                </div>
                <p className="text-xs font-sans text-muted-foreground">
                  {(storageUsage.used / 1024 / 1024).toFixed(1)}MB of {(storageUsage.total / 1024 / 1024).toFixed(0)}MB used
                </p>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard accent="sky" title="Data & Downloads">
        <div className="space-y-3">
          <DataButton icon={Download} label="Export JSON Backup" sub="Download all your data as a portable file" onClick={handleBackupJson} />
          {lastBackedUp ? (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border" style={{ background: 'hsl(210 50% 75% / 0.25)', borderColor: 'hsl(210 50% 75% / 0.4)' }}>
              <Clock className="w-4 h-4" style={{ color: 'hsl(210 50% 75%)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans font-semibold" style={{ color: 'hsl(210 55% 35%)' }}>Last Backed Up</p>
                <p className="text-xs font-sans font-medium" style={{ color: 'hsl(210 55% 45%)' }}>{lastBackedUp}</p>
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ color: 'hsl(210 50% 75%)', background: 'hsl(210 50% 75% / 0.3)' }}>✓</span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-sky-50/40 border border-sky-200/40">
              <Clock className="w-4 h-4" style={{ color: 'hsl(210 50% 75%)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans font-semibold" style={{ color: 'hsl(210 55% 35%)' }}>No Backups Yet</p>
                <p className="text-xs font-sans" style={{ color: 'hsl(210 55% 45%)' }}>Create your first backup to protect your progress</p>
              </div>
            </div>
          )}
          <DataButton icon={Upload} label="Import Backup" sub="Restore from a JSON file" onClick={() => fileRef.current?.click()} />
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileSelect} />

          <div className="pt-3 mt-3 grid gap-2 sm:grid-cols-2 border-t border-white/30">
            <DataButton icon={Printer} label="Daily Routines PDF" sub="Today's checklist" onClick={() => handleExportPdf('daily')} compact />
            <DataButton icon={Printer} label="Deep Clean PDF" sub="Every room" onClick={() => handleExportPdf('deepclean')} compact />
            <DataButton icon={Printer} label="30-Day Challenge PDF" sub="Progress sheet" onClick={() => handleExportPdf('challenge')} compact />
            <DataButton icon={FileText} label="Full Planner PDF" sub="Everything in one doc" onClick={() => handleExportPdf('all')} compact />
          </div>

          <button onClick={() => setConfirmTarget('reset')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-rose-300/60 text-rose-500 bg-rose-50/30 hover:bg-rose-50/50 transition-colors mt-2">
            <RotateCcw className="w-4 h-4" />
            <div className="text-left">
              <p className="text-sm font-sans font-semibold">Fresh Start</p>
              <p className="text-xs font-sans text-muted-foreground">Erase everything and start completely fresh — no guilt.</p>
            </div>
          </button>
        </div>
      </SectionCard>

      <SectionCard accent="champagne" icon={HelpCircle} title="FAQ">
        <div className="space-y-2">
          {FAQ_ITEMS.map((item) => {
            const isOpen = selectedFaqId === item.id;
            return (
              <div key={item.id} className={`rounded-xl overflow-hidden transition-colors ${isOpen ? 'bg-white/20' : ''}`}>
                <button onClick={() => setSelectedFaqId((prev) => (prev === item.id ? null : item.id))} className="w-full flex items-center justify-between p-3 text-left">
                  <span className="text-sm font-sans font-semibold pr-2 text-foreground">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="px-3 pb-3 text-sm font-sans leading-relaxed text-muted-foreground">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <ConfirmModal open={confirmTarget === 'reset'} onOpenChange={(o) => setConfirmTarget(o ? 'reset' : null)}
        title="Reset everything?" description="This permanently erases your tasks, family hub, vouchers, notes, and progress. Consider exporting a JSON backup first."
        confirmLabel="Yes, clear it all" cancelLabel="Keep my data" destructive soundEnabled={state.soundEnabled}
        onConfirm={() => { onReset(); setConfirmTarget(null); }} />
    </div>
  );
});

export default SettingsPanel;

type Accent = 'champagne' | 'blush' | 'lavender' | 'mint' | 'sky';

const ACCENT_COLORS: Record<Accent, string> = {
  champagne: 'hsl(45 60% 75%)',
  blush: 'hsl(350 45% 75%)',
  lavender: 'hsl(270 35% 75%)',
  mint: 'hsl(160 60% 75%)',
  sky: 'hsl(210 50% 75%)',
};

function SectionCard({ accent, title, icon: Icon, children }: { accent: Accent; title: string; icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; children: React.ReactNode; }) {
  return (
    <section className="glass-panel rounded-2xl p-6" style={{ borderLeft: `3px solid ${ACCENT_COLORS[accent]}` }}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4" style={{ color: ACCENT_COLORS[accent] }} />}
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({ label, sub, icon: Icon, on, onToggle }: { label: string; sub: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; on: boolean; onToggle: () => void; }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" style={{ color: on ? 'hsl(270 35% 75%)' : 'hsl(225 15% 55%)' }} />
        <div>
          <p className="text-sm font-sans font-semibold text-foreground">{label}</p>
          <p className="text-xs font-sans text-muted-foreground">{sub}</p>
        </div>
      </div>
      <button onClick={onToggle} aria-pressed={on} className="w-11 h-6 rounded-full transition-colors relative" style={{ background: on ? 'linear-gradient(135deg, hsl(270 35% 75%), hsl(210 50% 75%))' : 'hsl(220 18% 85%)' }}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function DataButton({ icon: Icon, label, sub, onClick, compact = false }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; sub: string; onClick: () => void; compact?: boolean; }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 ${compact ? 'px-3 py-2.5' : 'px-4 py-3'} rounded-xl transition-colors text-left bg-white/20 border border-white/40 hover:bg-white/30`}>
      <Icon className="w-4 h-4 shrink-0" style={{ color: 'hsl(210 50% 75%)' }} />
      <div className="min-w-0">
        <p className="text-sm font-sans font-semibold truncate text-foreground">{label}</p>
        <p className="text-xs font-sans truncate text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}
