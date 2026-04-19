import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Trophy, Flame, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const CHALLENGE_DAYS = [
  { id: 1, task: 'Clear kitchen counters' },
  { id: 2, task: 'Clean all mirrors' },
  { id: 3, task: 'Declutter one drawer' },
  { id: 4, task: 'Deep clean a toilet' },
  { id: 5, task: 'Organize under one sink' },
  { id: 6, task: 'Vacuum all floors' },
  { id: 7, task: 'Rest day \u2014 light tidy only' },
  { id: 8, task: 'Wash all bedding' },
  { id: 9, task: 'Clean refrigerator' },
  { id: 10, task: 'Dust all surfaces' },
  { id: 11, task: 'Mop all hard floors' },
  { id: 12, task: 'Clean oven & stovetop' },
  { id: 13, task: 'Organize one closet' },
  { id: 14, task: 'Rest day \u2014 maintenance only' },
  { id: 15, task: 'Deep clean shower / tub' },
  { id: 16, task: 'Clean all windows' },
  { id: 17, task: 'Declutter living room' },
  { id: 18, task: 'Clean behind furniture' },
  { id: 19, task: 'Organize pantry' },
  { id: 20, task: 'Deep clean entryway' },
  { id: 21, task: 'Rest day \u2014 enjoy your work!' },
  { id: 22, task: 'Clean all light fixtures' },
  { id: 23, task: 'Shampoo one carpet / rug' },
  { id: 24, task: 'Clean all baseboards' },
  { id: 25, task: 'Organize garage / storage' },
  { id: 26, task: 'Deep clean laundry room' },
  { id: 27, task: 'Clean outdoor areas' },
  { id: 28, task: 'Rest day \u2014 light tidy' },
  { id: 29, task: 'Final walkthrough & touch-ups' },
  { id: 30, task: 'Celebrate! Full house reset!' },
];

const CELL_COLORS = [
  'hsl(340 35% 85%)',  // Dusty Rose
  'hsl(350 45% 87%)',  // Light Pink
  'hsl(45 60% 88%)',   // Pale Cream
  'hsl(120 25% 80%)',  // Sage Green
  'hsl(165 40% 82%)',  // Mint Cyan
  'hsl(210 50% 85%)',  // Periwinkle Blue
  'hsl(270 35% 85%)',  // Lavender Purple
];

interface ThirtyDayChallengeProps {
  completed: Record<number, boolean>;
  onToggle: (day: number) => void;
}

const ThirtyDayChallenge = ({ completed, onToggle }: ThirtyDayChallengeProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const doneCount = Object.values(completed).filter(Boolean).length;
  const pct = Math.round((doneCount / 30) * 100);

  // Find the highest completed day, then count consecutive days backwards
  let lastCompletedDay = 0;
  for (let i = 30; i >= 1; i--) {
    if (completed[i]) { lastCompletedDay = i; break; }
  }
  let streak = 0;
  for (let i = lastCompletedDay; i >= 1; i--) {
    if (completed[i]) streak++;
    else break;
  }

  const handleToggle = (day: number) => {
    const wasDone = completed[day];
    onToggle(day);
    setSelectedDay(day);

    if (!wasDone) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ['hsl(350 45% 87%)', 'hsl(165 40% 82%)', 'hsl(270 35% 85%)', 'hsl(210 50% 85%)'], disableForReducedMotion: true });

      const newDone = doneCount + 1;
      if (newDone === 30) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 }, colors: ['hsl(45 60% 88%)', 'hsl(350 45% 87%)', 'hsl(165 40% 82%)', 'hsl(270 35% 85%)'] });
        toast.success('30-Day Challenge COMPLETE!', { description: 'You are absolutely incredible!' });
      }
    }
  };

  // Find the next incomplete day
  const nextIncompleteDay = CHALLENGE_DAYS.find((day) => !completed[day.id])?.id || 30;
  const todayTask = CHALLENGE_DAYS[nextIncompleteDay - 1];

  return (
    <div className="space-y-6">
      {/* Header with motivation */}
      <div className="rounded-3xl p-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 100%)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5" style={{ color: 'hsl(45 60% 70%)' }} />
              <span className="text-xs font-display font-semibold uppercase tracking-wider" style={{ color: 'hsl(270 35% 65%)' }}>30-Day Challenge</span>
            </div>
            <h2 className="text-2xl font-display font-bold mb-1" style={{ color: '#2D2D3D' }}>One Task A Day</h2>
            <p className="text-sm text-muted-foreground">Build a spotless home in 30 days. Rest days included. You've got this.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold" style={{ color: 'hsl(45 60% 70%)' }}>{doneCount}</div>
            <div className="text-xs text-muted-foreground">of 30 complete</div>
          </div>
        </div>

        <div className="w-full h-2.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'rgba(200, 180, 210, 0.15)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: pct === 100 ? 'linear-gradient(90deg, hsl(45 60% 75%), hsl(45 60% 65%))' : 'linear-gradient(90deg, hsl(165 40% 75%), hsl(165 40% 65%))' }}
          />
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" style={{ color: 'hsl(350 45% 75%)' }} />
            <span className="font-semibold" style={{ color: '#2D2D3D' }}>{streak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" style={{ color: 'hsl(45 60% 75%)' }} />
            <span className="font-semibold" style={{ color: '#2D2D3D' }}>{pct}%</span>
            <span className="text-muted-foreground">complete</span>
          </div>
        </div>
      </div>

      {/* Today's Task */}
      <div className="rounded-3xl p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-2">Today's Task</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Day {nextIncompleteDay}</p>
            <p className="text-lg font-display font-semibold" style={{ color: '#2D2D3D' }}>{todayTask.task}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleToggle(nextIncompleteDay)}
            className="shrink-0 p-3 rounded-2xl transition-all"
            style={{ backgroundColor: completed[nextIncompleteDay] ? 'hsl(165 40% 82%)' : 'rgba(200, 180, 210, 0.2)' }}
          >
            {completed[nextIncompleteDay]
              ? <CheckCircle2 className="w-6 h-6" style={{ color: 'hsl(165 40% 65%)' }} />
              : <Circle className="w-6 h-6 text-muted-foreground" />}
          </motion.button>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-3xl p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-4">Challenge Calendar</p>
        <div className="grid grid-cols-6 gap-2">
          {CHALLENGE_DAYS.map((day) => {
            const done = completed[day.id] || false;
            const isRest = day.task.includes('Rest day') || day.task.includes('Celebrate');
            const isToday = day.id === nextIncompleteDay;
            const color = CELL_COLORS[(day.id - 1) % CELL_COLORS.length];

            return (
              <motion.button
                key={day.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => { handleToggle(day.id); setSelectedDay(day.id); }}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-center transition-all font-semibold`}
                style={{
                  backgroundColor: done ? color : isToday ? 'rgba(200, 180, 210, 0.2)' : 'rgba(200, 180, 210, 0.08)',
                  border: isToday && !done ? '2px solid hsl(165 40% 65%)' : done ? `2px solid ${color}` : '2px solid transparent',
                  color: done ? '#2D2D3D' : 'hsl(220 10% 50%)',
                  opacity: done ? 1 : isToday ? 1 : 0.6,
                }}
              >
                <span className="text-sm">{day.id}</span>
                {done && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'hsl(165 40% 65%)' }} />
                  </motion.div>
                )}
                {isRest && !done && <span className="text-[7px] text-muted-foreground">rest</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {selectedDay && selectedDay !== nextIncompleteDay && (
        <motion.div key={selectedDay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Day {selectedDay}</p>
              <p className={`text-lg font-display font-semibold ${completed[selectedDay] ? 'line-through text-muted-foreground' : ''}`}
                style={{ color: completed[selectedDay] ? undefined : '#2D2D3D' }}>
                {CHALLENGE_DAYS[selectedDay - 1].task}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => handleToggle(selectedDay)}
              className="shrink-0 p-3 rounded-2xl transition-all"
              style={{ backgroundColor: completed[selectedDay] ? 'hsl(165 40% 82%)' : 'rgba(200, 180, 210, 0.2)' }}
            >
              {completed[selectedDay]
                ? <CheckCircle2 className="w-6 h-6" style={{ color: 'hsl(165 40% 65%)' }} />
                : <Circle className="w-6 h-6 text-muted-foreground" />}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default memo(ThirtyDayChallenge);