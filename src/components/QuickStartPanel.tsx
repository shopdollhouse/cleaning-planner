import { memo } from 'react';
import { Play, Shuffle, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { QuickStartTask, TimePeriod } from '@/hooks/useAppState';

interface QuickStartPanelProps {
  task: QuickStartTask | null;
  onPick: () => void;
  onComplete: (period: TimePeriod, taskId: string) => void;
  onClear: () => void;
}

const QuickStartPanel = memo(function QuickStartPanel({ task, onPick, onComplete, onClear }: QuickStartPanelProps) {
  return (
    <section className="rounded-3xl p-7 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
      <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, hsl(210 50% 75%), hsl(165 40% 75%), hsl(45 60% 75%))' }} />

      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-lg opacity-50" style={{ background: 'hsl(270 35% 75%)', width: '48px', height: '48px' }} />
            <div className="relative w-12 h-12 rounded-full grid place-items-center shrink-0" style={{ background: 'linear-gradient(135deg, hsl(270 35% 75%), hsl(210 50% 75%))' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#2D2D3D' }} />
            </div>
          </div>
          <div className="min-w-0 pt-1">
            <p className="text-[10px] uppercase tracking-[0.3em] font-display font-bold" style={{ color: '#2D2D3D' }}>⚡ Next Step</p>
            <h3 className="font-display text-2xl font-bold mt-2" style={{ color: '#2D2D3D' }}>
              {task ? task.label : 'Choose your starting point'}
            </h3>
            <p className="text-sm font-sans mt-1.5 text-muted-foreground/80">
              {task ? `${task.zone} · ${task.timeLabel}` : 'Beat decision fatigue—one small step forward.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0 lg:flex-col">
          {task && (
            <button
              onClick={() => {
                confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['hsl(350 45% 75%)', 'hsl(210 50% 75%)', 'hsl(270 35% 75%)', 'hsl(165 40% 75%)', 'hsl(45 60% 75%)'], disableForReducedMotion: true });
                onComplete(task.period, task.id);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-display font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, hsl(165 40% 75%), hsl(165 40% 65%))', color: '#2D2D3D', boxShadow: '0 8px 16px rgba(191, 221, 218, 0.3)' }}>
              <CheckCircle2 className="w-5 h-5" /> Done it!
            </button>
          )}
          <button
            onClick={onPick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-display font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: task ? 'rgba(255,255,255,0.6)' : 'linear-gradient(135deg, hsl(270 35% 75%), hsl(210 50% 75%))', color: task ? '#2D2D3D' : '#2D2D3D', border: task ? '1.5px solid hsl(270 35% 75%)' : 'none', boxShadow: task ? 'none' : '0 8px 16px rgba(223, 198, 228, 0.3)' }}
          >
            {task ? <Shuffle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {task ? 'Shuffle' : 'Pick for me'}
          </button>
          {task && (
            <button onClick={onClear} className="px-4 py-3 rounded-2xl text-xs font-sans font-semibold text-muted-foreground/70 hover:text-foreground transition-colors hover:bg-white/30">
              Skip
            </button>
          )}
        </div>
      </div>
    </section>
  );
});

export default QuickStartPanel;
