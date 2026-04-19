import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShieldCheck } from 'lucide-react';

const PrivacyShield = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/60 hover:bg-secondary transition-colors text-[10px] font-sans font-semibold tracking-wider uppercase"
          style={{ color: '#2D2D3D' }}
          aria-label="Privacy info"
        >
          <ShieldCheck className="w-3 h-3" />
          Private
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" sideOffset={8} className="w-72 glass-panel-strong rounded-xl p-4 z-[10000]">
        <h4 className="text-sm font-display font-semibold mb-2" style={{ color: 'hsl(var(--charcoal))' }}>
          Your Dollhouse stays private
        </h4>
        <p className="text-xs font-sans text-muted-foreground leading-relaxed">
          Every task, note, and brain-dump lives only on this device. Nothing is sent to a server. No accounts, no
          tracking, no cloud — just you and your sparkle.
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default PrivacyShield;
