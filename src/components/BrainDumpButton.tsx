import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Brain, Send, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { BrainDumpEntry } from '@/hooks/useAppState';

interface BrainDumpButtonProps {
  entries: BrainDumpEntry[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const BrainDumpButton = ({ entries, onAdd, onDelete, onClear }: BrainDumpButtonProps) => {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const submit = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
    toast.success('Brain dumped 🧠', { description: 'Cleared from your head — back to your task.' });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold font-sans bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/40 text-foreground"
          title="Quick brain dump"
        >
          <Brain className="w-4 h-4" style={{ color: 'hsl(270 35% 65%)' }} />
          <span className="hidden sm:inline">Brain Dump</span>
          {entries.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {entries.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-80 glass-panel rounded-2xl p-4 z-[10000]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-display font-semibold text-foreground">Offload a thought</h4>
        </div>
        <p className="text-[11px] font-sans text-muted-foreground mb-3 leading-relaxed">
          Got a distracting thought mid-clean? Capture it here so your brain can let it go.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoFocus
            placeholder="e.g. Email Sarah about Friday..."
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-background/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
          <button onClick={submit} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity" title="Save">
            <Send className="w-4 h-4" />
          </button>
        </div>

        {entries.length > 0 && (
          <>
            <div className="max-h-56 overflow-y-auto space-y-1.5 mt-2">
              <AnimatePresence>
                {entries.map((entry) => (
                  <motion.div key={entry.id} layout initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 p-2 rounded-lg bg-white/20 group">
                    <span className="flex-1 text-xs font-sans leading-relaxed text-foreground">{entry.text}</span>
                    <button onClick={() => onDelete(entry.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" title="Remove">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {!confirmClear ? (
              <button onClick={() => setConfirmClear(true)}
                className="w-full mt-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground hover:text-destructive transition-colors py-1">
                Clear all
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-lg bg-red-50/40 border border-red-200/40 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  <p className="text-[10px] font-sans font-semibold text-red-700">Delete all entries?</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { onClear(); setConfirmClear(false); toast.success('Brain dump cleared', { description: 'All thoughts removed' }); }}
                    className="flex-1 px-2 py-1 text-[10px] font-bold rounded bg-red-500 text-white hover:bg-red-600 transition-colors">
                    Yes, clear
                  </button>
                  <button onClick={() => setConfirmClear(false)}
                    className="flex-1 px-2 py-1 text-[10px] font-bold rounded bg-white/20 text-foreground hover:bg-white/30 transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default BrainDumpButton;
