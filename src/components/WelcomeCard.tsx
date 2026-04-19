import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Trophy, Heart } from 'lucide-react';

interface WelcomeCardProps {
  day: string;
  userName?: string;
  streakCount?: number;
  totalTasksCompleted?: number;
}

const dayGreetings: Record<string, { greeting: string; tip: string; affirmation: string }> = {
  Monday: {
    greeting: 'Fresh Start Monday',
    tip: 'Focus on kitchens & bathrooms today.',
    affirmation: 'You showed up. That is the hardest part.',
  },
  Tuesday: {
    greeting: 'Tidy Tuesday',
    tip: 'Dust all surfaces & vacuum floors.',
    affirmation: 'Progress, not perfection. You have got this.',
  },
  Wednesday: {
    greeting: 'Wellness Wednesday',
    tip: 'Declutter one drawer or shelf.',
    affirmation: 'One small win changes your whole day.',
  },
  Thursday: {
    greeting: 'Thorough Thursday',
    tip: 'Deep clean one room completely.',
    affirmation: 'Your effort matters, even when it does not feel like it.',
  },
  Friday: {
    greeting: 'Fresh Friday',
    tip: 'Laundry day \u2014 wash sheets & towels.',
    affirmation: 'Almost weekend! Ride that Friday energy.',
  },
  Saturday: {
    greeting: 'Sparkle Saturday',
    tip: 'Polish mirrors, glass & fixtures.',
    affirmation: 'You deserve a space that feels good.',
  },
  Sunday: {
    greeting: 'Self-Care Sunday',
    tip: 'Light cleaning, prep for the week.',
    affirmation: 'Rest is productive. Be gentle with yourself.',
  },
};

const WelcomeCard = ({ day, userName, streakCount = 0, totalTasksCompleted = 0 }: WelcomeCardProps) => {
  const info = dayGreetings[day] || dayGreetings.Monday;
  const displayName = userName ? `${userName}'s` : 'Your';

  const milestone = useMemo(() => {
    if (totalTasksCompleted >= 100) return { icon: Trophy, label: 'Centurion', color: 'hsl(45 60% 75%)' };
    if (totalTasksCompleted >= 50) return { icon: Sparkles, label: 'Powerhouse', color: 'hsl(270 35% 75%)' };
    if (totalTasksCompleted >= 25) return { icon: Heart, label: 'Momentum', color: 'hsl(350 45% 75%)' };
    if (totalTasksCompleted >= 10) return { icon: Sparkles, label: 'Rising Star', color: 'hsl(210 50% 75%)' };
    if (totalTasksCompleted >= 1) return { icon: Heart, label: 'First Win', color: 'hsl(160 60% 75%)' };
    return null;
  }, [totalTasksCompleted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="rounded-3xl p-8 mb-8 overflow-hidden relative glass-panel"
      style={{
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Gradient accent bar */}
      <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, hsl(350 45% 75%), hsl(270 35% 75%), hsl(165 40% 75%))' }} />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }} className="flex items-center gap-2 mb-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'hsl(270 35% 75%)' }} />
            </motion.div>
            <span className="text-[11px] font-display font-bold uppercase tracking-[0.3em] text-foreground">
              {day}
            </span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }} className="text-3xl md:text-4xl font-display font-bold mb-2 text-foreground">
            {displayName} <span style={{ background: 'linear-gradient(135deg, hsl(350 45% 75%), hsl(270 35% 75%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{info.greeting.split(' ')[1]}</span>
          </motion.h2>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.4 }} className="text-base font-sans mb-4 text-foreground">
            {info.tip}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }} className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(223, 198, 228, 0.1)', borderLeft: '3px solid hsl(270 35% 75%)' }}>
            <p className="text-sm font-sans italic text-foreground/80">
              &ldquo;{info.affirmation}&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Stats badges */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="flex flex-wrap md:flex-col gap-3 shrink-0">
          {streakCount > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(350 45% 75%), hsl(340 35% 75%))', boxShadow: '0 4px 12px rgba(234, 193, 200, 0.3)' }}>
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Flame className="w-4 h-4" style={{ color: 'white' }} />
              </motion.div>
              <span className="text-xs font-bold font-display text-white">
                {streakCount} day{streakCount > 1 ? 's' : ''} 🔥
              </span>
            </motion.div>
          )}
          {totalTasksCompleted > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(45 60% 75%), hsl(45 50% 70%))', boxShadow: '0 4px 12px rgba(242, 228, 179, 0.4)' }}>
              <Trophy className="w-4 h-4" style={{ color: 'white' }} />
              <span className="text-xs font-bold font-display text-white">
                {totalTasksCompleted} Done
              </span>
            </motion.div>
          )}
          {milestone && (
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}dd)`, boxShadow: `0 4px 12px ${milestone.color}40` }}>
              <milestone.icon className="w-4 h-4" style={{ color: 'white' }} />
              <span className="text-[11px] font-bold font-display uppercase tracking-wider text-white">
                {milestone.label}
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;