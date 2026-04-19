import { memo, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { playClick } from '@/lib/sound';

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  soundEnabled?: boolean;
  onConfirm: () => void;
}

const ConfirmModal = memo(function ConfirmModal({
  open, onOpenChange, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive = false, soundEnabled = false, onConfirm,
}: ConfirmModalProps) {
  useEffect(() => { if (open) playClick(soundEnabled); }, [open, soundEnabled]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-panel border-0 shadow-xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {destructive && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              </span>
            )}
            <AlertDialogTitle className="font-display text-xl tracking-wide text-foreground">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="font-sans pt-2 text-sm leading-relaxed">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => playClick(soundEnabled)} className="font-sans">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={() => { playClick(soundEnabled); onConfirm(); }}
            className="font-sans font-semibold text-white shadow-md"
            style={{ background: destructive ? 'linear-gradient(135deg, hsl(350 45% 75%), hsl(350 35% 65%))' : 'linear-gradient(135deg, hsl(45 60% 75%), hsl(270 35% 75%))' }}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

export default ConfirmModal;
