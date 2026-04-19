import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LifeBuoy, RefreshCw } from 'lucide-react';

const STUCK_TIPS = [
  'Pick up just 3 items. That counts as a win.',
  'Set the timer for 5 minutes. You can stop after.',
  'Start with the easiest task on the list — momentum matters more than logic.',
  'Put on a song you love. Clean only while it plays.',
  'Move ONE thing from the floor. That\'s it. That\'s the goal.',
  'Body double: text a friend "I\'m cleaning for 10 min" and start.',
  'Lower the bar. "Done" beats "perfect" every single time.',
  'Tackle the most visible spot — instant dopamine when you see it.',
  'Reset one surface (the kitchen counter, your desk). Tiny wins compound.',
  'Your only job right now: empty the dishwasher. Then re-decide.',
];

interface StuckButtonProps {
  size?: 'sm' | 'md';
}

const StuckButton = ({ size = 'sm' }: StuckButtonProps) => {
  const [seed, setSeed] = useState(0);
  const tip = useMemo(() => STUCK_TIPS[seed % STUCK_TIPS.length], [seed]);

  return (
    <Popover onOpenChange={(open) => open && setSeed(Math.floor(Math.random() * STUCK_TIPS.length))}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 rounded-full font-sans font-bold transition-all hover:scale-105 ${
            size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
          }`}
          style={{ backgroundColor: 'rgba(242, 228, 179, 0.4)', color: '#2D2D3D' }}
          aria-label="I'm stuck — give me a tip"
        >
          <LifeBuoy className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Stuck?
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" sideOffset={8} className="w-72 glass-panel-strong rounded-xl p-4 z-[10000]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-display font-semibold" style={{ color: 'hsl(var(--charcoal))' }}>
            Try this 👇
          </h4>
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="p-1 rounded hover:bg-secondary/60 transition-colors"
            title="Another tip"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <p className="text-sm font-sans leading-relaxed" style={{ color: 'hsl(var(--charcoal))' }}>
          {tip}
        </p>
        <p className="text-[10px] font-sans uppercase tracking-wider mt-3 text-muted-foreground">
          Executive function reset
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default StuckButton;
