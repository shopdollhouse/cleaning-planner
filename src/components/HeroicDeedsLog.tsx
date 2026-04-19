import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Crown, Sparkles } from 'lucide-react';
import type { HeroicDeed } from '@/hooks/useAppState';

interface HeroicDeedsLogProps { deeds: HeroicDeed[]; }

const HeroicDeedsLog = memo(function HeroicDeedsLog({ deeds }: HeroicDeedsLogProps) {
  const [open, setOpen] = useState(false);

  if (deeds.length === 0) {
    return (
      <section className="glass-panel rounded-2xl p-4 flex items-center gap-3">
        <Crown className="w-4 h-4 text-[hsl(45_60%_75%)]" />
        <p className="text-sm font-sans text-muted-foreground">Your Heroic Deeds log will appear here after your first completed task.</p>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-2xl p-4">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <span className="flex items-center gap-2 min-w-0">
          <Crown className="w-4 h-4 shrink-0 text-[hsl(45_60%_75%)]" />
          <span>
            <span className="block font-display text-lg font-semibold text-foreground">Heroic Deeds</span>
            <span className="block text-xs font-sans text-muted-foreground">
              Celebrate your wins — {deeds.length} task{deeds.length !== 1 ? 's' : ''} completed · tap to {open ? 'hide' : 'view'}
            </span>
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="deeds-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {deeds.map((deed) => (
                <div key={deed.id} className="flex items-start gap-3 rounded-xl px-3 py-2 bg-white/20">
                  <Sparkles className="w-3.5 h-3.5 mt-1 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-sans font-semibold truncate text-foreground">{deed.label}</p>
                    <p className="text-xs font-sans text-muted-foreground">{deed.flourish} · {new Date(deed.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

export default HeroicDeedsLog;
