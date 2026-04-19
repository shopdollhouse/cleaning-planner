import { motion } from 'framer-motion';
import { Brain, ShoppingCart, Utensils, Target, Bell, Sparkles, BookOpen } from 'lucide-react';

const NOTE_CONFIG = [
  { label: 'Brain Dump', icon: Brain, color: 'hsl(350 45% 75%)', bgColor: 'hsl(350 45% 75% / 0.12)', placeholder: 'Let it all out…' },
  { label: 'Shopping List', icon: ShoppingCart, color: 'hsl(45 60% 75%)', bgColor: 'hsl(45 60% 75% / 0.12)', placeholder: 'What do you need?' },
  { label: 'Meal Plan', icon: Utensils, color: 'hsl(165 40% 75%)', bgColor: 'hsl(165 40% 75% / 0.12)', placeholder: 'Plan your meals…' },
  { label: 'Weekly Goals', icon: Target, color: 'hsl(210 50% 75%)', bgColor: 'hsl(210 50% 75% / 0.12)', placeholder: 'What\'s this week about?' },
  { label: 'Reminders', icon: Bell, color: 'hsl(270 35% 75%)', bgColor: 'hsl(270 35% 75% / 0.12)', placeholder: 'Don\'t forget…' },
  { label: 'Cleaning Notes', icon: Sparkles, color: 'hsl(340 35% 75%)', bgColor: 'hsl(340 35% 75% / 0.12)', placeholder: 'Room notes & tips…' },
  { label: 'Free Page', icon: BookOpen, color: 'hsl(160 60% 75%)', bgColor: 'hsl(120 25% 75% / 0.12)', placeholder: 'Your space…' },
];

interface StickyNotesProps {
  notes: string[];
  onUpdateNote: (index: number, value: string) => void;
}

const StickyNotes = ({ notes, onUpdateNote }: StickyNotesProps) => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {NOTE_CONFIG.map((config, i) => {
        const Icon = config.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-3xl p-5 flex flex-col gap-4 min-h-[280px] transition-all duration-300"
            style={{
              background: config.bgColor,
              border: `1px solid ${config.color}30`,
              boxShadow: `0 4px 16px ${config.color}10`,
            }}
          >
            {/* Header with icon */}
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: config.color, color: '#fff' }}
              >
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <h3 className="font-display font-semibold text-sm" style={{ color: '#2D2D3D' }}>
                {config.label}
              </h3>
            </div>

            {/* Textarea */}
            <textarea
              value={notes[i] || ''}
              onChange={(e) => onUpdateNote(i, e.target.value)}
              placeholder={config.placeholder}
              className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed font-sans transition-colors focus:text-opacity-100"
              style={{
                color: '#2D2D3D',
                caretColor: config.color,
              }}
            />

            {/* Footer */}
            <p className="text-[10px] font-sans" style={{ color: `${config.color}60` }}>
              auto-saved · local only
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StickyNotes;
