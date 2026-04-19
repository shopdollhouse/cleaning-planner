import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SectionExplainerProps {
  title: string;
  explanation: string;
  tips?: string[];
  storageKey?: string;
}

export function SectionExplainer({ title, explanation, tips, storageKey }: SectionExplainerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (!storageKey) return false;
    return localStorage.getItem(storageKey) === 'true';
  });

  const handleDismiss = () => {
    if (storageKey) localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-2xl p-4 mb-4 overflow-hidden flex gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(45, 200, 130, 0.08) 0%, rgba(200, 180, 210, 0.1) 100%)',
          border: '1px solid rgba(200, 180, 210, 0.3)',
        }}
      >
        <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'hsl(165 40% 60%)' }} />

        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-sm mb-1" style={{ color: 'hsl(var(--charcoal))' }}>
            💡 {title}
          </p>
          <p className="text-xs font-sans text-muted-foreground mb-2 leading-relaxed">
            {explanation}
          </p>

          {tips && tips.length > 0 && (
            <ul className="text-xs font-sans text-muted-foreground space-y-1 ml-4 list-disc">
              {tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Dismiss explanation"
        >
          <X className="w-4 h-4" style={{ color: 'hsl(var(--charcoal))' }} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
