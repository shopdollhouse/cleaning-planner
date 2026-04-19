import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import type { DailyTasks, TimePeriod } from '@/hooks/useAppState';

const QUICK_PICKS = ['Vacuum', 'Dust surfaces', 'Dishes', 'Wipe counters', 'Take out trash', 'Sweep floor', 'Mop floor', 'Tidy up'];

interface DailyRoutinesQuickSearchProps {
  tasks: DailyTasks;
  onAddTask: (period: TimePeriod, label: string, zone: string) => void;
}

export default function DailyRoutinesQuickSearch({ tasks, onAddTask }: DailyRoutinesQuickSearchProps) {
  const [searchFilter, setSearchFilter] = useState('');

  // Get all existing task labels across all periods
  const existingTasks = useMemo(() => {
    const all = new Set<string>();
    const periods: TimePeriod[] = ['morning', 'afternoon', 'evening'];
    periods.forEach(period => {
      tasks[period].forEach(task => {
        all.add(task.label.toLowerCase());
      });
    });
    return all;
  }, [tasks]);

  // Filter quick picks based on search and existing tasks
  const filteredQuickPicks = useMemo(() => {
    return QUICK_PICKS.filter(
      (p) =>
        p.toLowerCase().includes(searchFilter.toLowerCase()) &&
        !existingTasks.has(p.toLowerCase())
    );
  }, [searchFilter, existingTasks]);

  const handleAddQuickPick = (label: string) => {
    // Add to morning routine by default
    onAddTask('morning', label, 'General');
    setSearchFilter('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 overflow-hidden glass-panel"
      style={{
        backdropFilter: 'blur(12px)',
        border: `1px solid hsl(var(--border))`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground"
            strokeWidth={2}
          />
          <input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search or type a task…"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border text-foreground placeholder:text-muted-foreground focus:outline-none"
            style={{
              backgroundColor: 'hsl(var(--muted) / 0.3)',
              borderColor: 'hsl(var(--border))',
            }}
          />
        </div>

        {filteredQuickPicks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filteredQuickPicks.map((pick) => (
              <button
                key={pick}
                onClick={() => handleAddQuickPick(pick)}
                className="px-3 py-1.5 text-xs rounded-lg font-semibold transition-all hover:shadow-sm text-foreground"
                style={{
                  backgroundColor: 'hsl(var(--muted) / 0.2)',
                  border: `1px solid hsl(var(--border))`,
                }}
              >
                + {pick}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
