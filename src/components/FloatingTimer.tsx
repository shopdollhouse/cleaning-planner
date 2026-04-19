import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Pause, Play, RotateCcw, X } from 'lucide-react';

const PRESETS = [
  { label: 'Quick', tip: 'Quick start · 1m', seconds: 60 },
  { label: 'Boost', tip: 'Boost · 2m', seconds: 120 },
  { label: 'Dash', tip: 'Dash · 3m', seconds: 180 },
  { label: 'Power', tip: 'Power Minute · 5m blast', seconds: 300 },
  { label: 'Burst', tip: 'Burst clean · 10m', seconds: 600 },
  { label: 'Sprint', tip: 'Sprint · 15m', seconds: 900 },
  { label: 'Deep', tip: 'Deep Dive · 20m', seconds: 1200 },
  { label: 'Flow', tip: 'Flow state · 25m', seconds: 1500 },
];

const PresetButtons = memo(({
  totalSeconds,
  onSetDuration
}: {
  totalSeconds: number;
  onSetDuration: (seconds: number) => void;
}) => (
  <div className="flex gap-2 mb-4 flex-wrap">
    {PRESETS.map((p) => (
      <button
        key={p.seconds}
        onClick={() => onSetDuration(p.seconds)}
        title={p.tip}
        className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all ${
          totalSeconds === p.seconds
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
        }`}
        aria-label={`${p.label} timer (${p.tip})`}
        aria-pressed={totalSeconds === p.seconds}
      >
        {p.label}
      </button>
    ))}
  </div>
));

interface FloatingTimerProps {
  active: boolean;
  timeRemaining: number;
  totalSeconds: number;
  onToggle: () => void;
  onReset: () => void;
  onSetDuration: (seconds: number) => void;
  visible: boolean;
  onToggleVisible: () => void;
  mode?: 'floating' | 'card';
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatGentleTime = (seconds: number) => {
  if (seconds <= 60) return 'less than a minute remains';
  const minutes = Math.ceil(seconds / 60);
  return `about ${minutes} minute${minutes === 1 ? '' : 's'} remain`;
};

const FloatingTimer = memo(function FloatingTimer({
  active, timeRemaining, totalSeconds,
  onToggle, onReset, onSetDuration,
  visible, onToggleVisible,
  mode = 'floating',
}: FloatingTimerProps) {
  const pct = totalSeconds > 0 ? Math.max(0, (timeRemaining / totalSeconds) * 100) : 0;
  const elapsedPct = 100 - pct;

  if (mode === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl p-6 overflow-hidden mb-6 glass-panel"
        style={{ backdropFilter: 'blur(12px)', border: `1px solid hsl(var(--border))`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" style={{ color: 'hsl(270 40% 58%)' }} />
            <span className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Gentle Focus</span>
          </div>
        </div>

        <PresetButtons totalSeconds={totalSeconds} onSetDuration={onSetDuration} />

        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
              <circle cx="40" cy="40" r="34" fill="none"
                stroke="hsl(270 35% 75%)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-display font-bold text-foreground">{Math.round(elapsedPct)}%</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm font-sans font-semibold text-foreground">{formatGentleTime(timeRemaining)}</p>
            <p className="text-xs text-muted-foreground mt-1">Exact time is tucked away: {formatTime(timeRemaining)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onToggle}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              {active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={onReset}
              className="p-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Collapsed mini button when hidden */}
      <AnimatePresence>
        {!visible && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onToggleVisible}
            className="fixed bottom-6 right-6 z-[9999] w-12 h-12 rounded-full glass-timer flex items-center justify-center hover:scale-105 transition-transform"
            title="Show Timer"
          >
            <Timer className="w-5 h-5 text-primary" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded timer */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[9999] glass-timer rounded-2xl p-4 min-w-[200px]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-xs font-display font-semibold text-foreground uppercase tracking-wider">Gentle Focus</span>
              </div>
              <button onClick={onToggleVisible} className="p-1 rounded-lg hover:bg-secondary/60 transition-colors" title="Hide Timer">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex gap-1 mb-3">
              {PRESETS.map((p) => (
                <button key={p.seconds} onClick={() => onSetDuration(p.seconds)} title={p.tip}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-sans font-semibold transition-all ${
                    totalSeconds === p.seconds
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center mb-3">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <circle cx="40" cy="40" r="34" fill="none"
                    stroke="hsl(270 35% 75%)" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-display font-bold text-foreground">{Math.round(elapsedPct)}%</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-3">
              <p className="text-xs font-sans font-semibold text-foreground">{formatGentleTime(timeRemaining)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Exact time is tucked away: {formatTime(timeRemaining)}</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button onClick={onToggle}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                {active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={onReset}
                className="p-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default FloatingTimer;

export function useTimer(initialSeconds = 300) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [timerActive, setTimerActive] = useState(false);
  const [timerVisible, setTimerVisible] = useState(true);

  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const initialTimeRef = useRef(initialSeconds);

  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    // Start RAF-based countdown to prevent drift
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      initialTimeRef.current = timeRemaining;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
      const newRemaining = Math.max(0, (initialTimeRef.current || timeRemaining) - elapsed);

      if (newRemaining <= 0) {
        setTimeRemaining(0);
        setTimerActive(false);
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      } else {
        setTimeRemaining(newRemaining);
        rafIdRef.current = requestAnimationFrame(updateTimer);
      }
    };

    rafIdRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [timerActive, timeRemaining]);

  const toggleTimer = useCallback(() => {
    setTimerActive((a) => {
      if (a) {
        // Stopping timer
        startTimeRef.current = null;
      }
      return !a;
    });
  }, []);

  const resetTimer = useCallback(() => {
    startTimeRef.current = null;
    setTimerActive(false);
    setTimeRemaining(totalSeconds);
  }, [totalSeconds]);

  const setDuration = useCallback((seconds: number) => {
    startTimeRef.current = null;
    setTimerActive(false);
    setTotalSeconds(seconds);
    setTimeRemaining(seconds);
  }, []);

  const toggleVisible = useCallback(() => setTimerVisible((v) => !v), []);

  return { timerActive, timeRemaining, totalSeconds, toggleTimer, resetTimer, setDuration, timerVisible, toggleVisible };
}
