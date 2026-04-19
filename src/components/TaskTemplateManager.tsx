import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Copy, ChevronDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { TaskTemplate, TimePeriod } from '@/hooks/useAppState';

interface TaskTemplateManagerProps {
  templates: TaskTemplate[];
  onCreateTemplate: (name: string, description: string, tasks: Array<{ label: string; zone: string }>) => void;
  onLoadTemplate: (templateId: string, period: TimePeriod) => void;
  onDeleteTemplate: (templateId: string) => void;
}

const TaskTemplateManager = memo(function TaskTemplateManager({
  templates,
  onCreateTemplate,
  onLoadTemplate,
  onDeleteTemplate,
}: TaskTemplateManagerProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Copy className="w-4 h-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-sans font-semibold text-foreground">Task Templates</p>
            <p className="text-xs font-sans text-muted-foreground">{templates.length} saved</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 shrink-0 text-primary transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2">
            {templates.length === 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50/40 border border-amber-200/40">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-xs font-sans text-amber-700">
                  Create your first template by selecting tasks and clicking "Save as Template"
                </p>
              </div>
            ) : (
              templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  className="p-3 rounded-lg bg-white/20 border border-white/40 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-semibold text-foreground truncate">{template.name}</p>
                      <p className="text-xs font-sans text-muted-foreground truncate">{template.description}</p>
                      <p className="text-[10px] font-sans text-muted-foreground/60 mt-1">
                        {template.tasks.length} task{template.tasks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteTemplate(template.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => {
                          onLoadTemplate(template.id, period);
                          toast.success(`Template loaded to ${period}`, {
                            description: `${template.tasks.length} tasks added`,
                          });
                        }}
                        className="px-2 py-1 text-[10px] rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold capitalize"
                      >
                        → {period}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TaskTemplateManager;
