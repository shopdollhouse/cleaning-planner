import { motion } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DaySelectorProps {
  currentDay: string;
  onSelectDay: (day: string) => void;
}

const DaySelector = ({ currentDay, onSelectDay }: DaySelectorProps) => {
  const dayColors: Record<string, string> = {
    Monday: 'hsl(350 45% 75%)',      // Light Pink
    Tuesday: 'hsl(210 50% 75%)',     // Periwinkle
    Wednesday: 'hsl(270 35% 75%)',   // Lavender
    Thursday: 'hsl(165 40% 75%)',    // Mint Cyan
    Friday: 'hsl(45 60% 75%)',       // Pale Cream
    Saturday: 'hsl(340 35% 75%)',    // Dusty Rose
    Sunday: 'hsl(160 60% 75%)',      // Sage Green
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-3xl p-6 mb-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
      <p className="text-[11px] text-muted-foreground/70 uppercase tracking-[0.3em] font-display font-semibold mb-4 px-1">Pick your day</p>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, idx) => {
          const active = day === currentDay;
          const color = dayColors[day];
          return (
            <motion.button
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDay(day)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-2xl transition-all"
              style={{
                background: active ? `${color}15` : 'rgba(255,255,255,0.4)',
                border: active ? `2px solid ${color}` : '1px solid rgba(200, 180, 210, 0.2)',
                boxShadow: active ? `0 4px 12px ${color}22` : 'none',
              }}
            >
              <span className="text-[10px] font-display font-bold" style={{ color: active ? color : 'rgba(45, 45, 61, 0.6)' }}>
                {day.slice(0, 3)}
              </span>
              {active && (
                <motion.div
                  layoutId="dayIndicator"
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: color }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DaySelector;
