import { memo } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Timer, Pause, Play, RotateCcw } from 'lucide-react';
import { NAV_GROUPS, SIDEBAR_WIDTH, HEADER_OFFSET, type View, type SidebarMode } from '@/config/navigation';

const TIMER_PRESETS = [
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
  { label: '20m', seconds: 1200 },
  { label: '25m', seconds: 1500 },
];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export interface AppSidebarProps {
  activeView: View;
  onSelectView: (view: View) => void;
  mode: SidebarMode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  timerActive?: boolean;
  timeRemaining?: number;
  totalSeconds?: number;
  onToggleTimer?: () => void;
  onSetTimerDuration?: (seconds: number) => void;
  onResetTimer?: () => void;
}

const AppSidebar = memo(function AppSidebar({
  activeView,
  onSelectView,
  mode,
  soundEnabled,
  onToggleSound,
  timerActive = false,
  timeRemaining = 0,
  totalSeconds = 0,
  onToggleTimer,
  onSetTimerDuration,
  onResetTimer,
}: AppSidebarProps) {
  const isExpanded = mode === 'expanded';
  const width = SIDEBAR_WIDTH[mode];

  const activeItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeView);
  const activePalette = activeItem?.palette;

  const pct = totalSeconds > 0 ? Math.max(0, (timeRemaining / totalSeconds) * 100) : 0;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
      className="shrink-0 overflow-hidden self-start z-40 sticky rounded-3xl"
      style={{
        top: HEADER_OFFSET,
        height: `calc(100vh - ${HEADER_OFFSET}px)`,
        overflowY: 'auto',
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(220,205,220,0.40)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      }}
      aria-label="Primary navigation"
    >
      <div style={{ width: SIDEBAR_WIDTH.expanded }} className="p-4 space-y-6">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.id}>
            {groupIndex > 0 && isExpanded && (
              <div className="mb-4 px-3">
                <div className="h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
              </div>
            )}
            {isExpanded && (
              <div className="px-3 mb-3">
                <p
                  className="font-display text-[13px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: group.taglineColor ?? 'hsl(350 45% 75%)' }}
                >
                  {group.label}
                </p>
                <p className="text-[11px] italic font-sans mt-1" style={{ color: group.taglineColor ?? 'rgba(45,45,61,0.55)' }}>
                  {group.tagline}
                </p>
              </div>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = activeView === item.id;
                const p = item.palette;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelectView(item.id)}
                      className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold transition-all"
                      style={
                        active
                          ? {
                              background: p.bg,
                              border: `1px solid ${p.border}`,
                              color: p.label,
                              boxShadow: `0 1px 6px 0 ${p.accent}22`,
                            }
                          : {
                              border: '1px solid transparent',
                              color: 'rgba(45,45,61,0.55)',
                            }
                      }
                      aria-current={active ? 'page' : undefined}
                    >
                      <item.icon
                        className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
                        style={{ color: active ? p.accent : 'rgba(45,45,61,0.40)' }}
                      />
                      {isExpanded && <span className="truncate">{item.label}</span>}
                      {isExpanded && active && (
                        <span
                          className="ml-auto h-1.5 w-1.5 rounded-full"
                          style={{ background: p.accent }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="pt-4 mt-2 space-y-4 border-t" style={{ borderColor: activePalette ? `${activePalette.border}` : 'rgba(234, 193, 200, 0.3)' }}>
          {/* Sound toggle */}
          <div className="flex items-center justify-between px-4 pb-4 border-b" style={{ borderColor: activePalette ? `${activePalette.border}` : 'rgba(234, 193, 200, 0.3)' }}>
            {isExpanded && (
              <span className="text-[10px] uppercase tracking-[0.22em] font-sans text-muted-foreground">Sound</span>
            )}
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: soundEnabled ? activePalette?.accent ?? 'hsl(350 45% 75%)' : 'rgba(45,45,61,0.6)' }}
              aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Timer section */}
          {isExpanded && onToggleTimer && onSetTimerDuration && onResetTimer && (
            <div className="px-4 space-y-3">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" style={{ color: activePalette?.accent ?? 'hsl(270 35% 75%)' }} />
                <span className="text-[10px] uppercase tracking-[0.22em] font-sans text-muted-foreground">Timer</span>
              </div>

              {/* Timer display */}
              <div className="bg-gradient-to-br from-white/30 to-white/10 rounded-2xl p-3 backdrop-blur-sm border border-white/20">
                <div className="text-center mb-3">
                  <div className="text-xl font-display font-bold" style={{ color: activePalette?.accent ?? 'hsl(270 35% 75%)' }}>
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {totalSeconds === 0 ? 'Pick time' : `${Math.round(pct)}%`}
                  </div>
                </div>

                {/* Preset buttons */}
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {TIMER_PRESETS.map((preset) => (
                    <button
                      key={preset.seconds}
                      onClick={() => onSetTimerDuration(preset.seconds)}
                      className="px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all"
                      style={{
                        background: totalSeconds === preset.seconds ? (activePalette?.bg ?? 'rgba(270, 35%, 75%, 0.15)') : 'rgba(45,45,61,0.08)',
                        color: totalSeconds === preset.seconds ? (activePalette?.accent ?? 'hsl(270 35% 75%)') : 'rgba(45,45,61,0.7)',
                        border: totalSeconds === preset.seconds ? `1px solid ${activePalette?.accent ?? 'hsl(270 35% 75%)'}40` : '1px solid transparent',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Control buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={onToggleTimer}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all text-white"
                    style={{ background: activePalette?.accent ?? 'hsl(270 35% 75%)' }}
                  >
                    {timerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {timerActive ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={onResetTimer}
                    className="px-2 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(45,45,61,0.08)', color: 'rgba(45,45,61,0.7)' }}
                    title="Reset timer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
});

export default AppSidebar;
