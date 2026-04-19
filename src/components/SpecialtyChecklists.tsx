import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Monitor, Zap, Truck, ChevronDown, ChevronUp, Trophy, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import type { CustomSpecialtyItem } from '@/hooks/useAppState';

interface ChecklistItem { id: string; label: string; }
interface ChecklistGroup { title: string; items: ChecklistItem[]; }

interface InteractiveChecklistProps {
  groups: ChecklistGroup[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  customItemIds?: string[];
  onDeleteCustomItem?: (itemId: string) => void;
}

const toSectionKey = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const getGroupSectionId = (group: ChecklistGroup) => {
  const seed = group.items[0]?.id ?? group.title;
  return `specialty-group-${toSectionKey(`${group.title}-${seed}`)}`;
};

const InteractiveChecklist = ({ groups, checked, onToggle, customItemIds, onDeleteCustomItem }: InteractiveChecklistProps) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(() => {
    const firstGroup = groups[0];
    return firstGroup ? getGroupSectionId(firstGroup) : null;
  });

  const toggleGroup = (sectionId: string) => {
    setSelectedSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const sectionId = getGroupSectionId(group);
        const doneCount = group.items.filter((i) => checked[i.id]).length;
        const isOpen = selectedSectionId === sectionId;
        const pct = group.items.length > 0 ? Math.round((doneCount / group.items.length) * 100) : 0;

        return (
          <div key={sectionId} className="glass-panel rounded-2xl overflow-hidden">
            <button onClick={() => toggleGroup(sectionId)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-sm font-display font-semibold text-foreground">{group.title}</span>
                <span className="text-xs text-muted-foreground">{doneCount}/{group.items.length}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Mini progress indicator */}
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg, hsl(210 50% 75%), hsl(270 35% 75%))' }} />
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="px-5 pb-4 space-y-1">
                    {group.items.map((item) => {
                      const done = checked[item.id] || false;
                      const isCustom = customItemIds?.includes(item.id);
                      return (
                        <div key={item.id} className="flex items-center group/item">
                          <button onClick={() => onToggle(item.id)}
                            className={`flex-1 flex items-center gap-3 p-3 rounded-xl text-left transition-all ${done ? 'opacity-70' : 'hover:bg-secondary/40'}`}>
                            {done ? <CheckCircle2 className="w-[18px] h-[18px] shrink-0" style={{ color: 'hsl(270 35% 75%)' }} /> : <Circle className="w-[18px] h-[18px] text-muted-foreground shrink-0" />}
                            <span className={`text-sm font-sans ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.label}</span>
                          </button>
                          {isCustom && onDeleteCustomItem && (
                            <button onClick={() => onDeleteCustomItem(item.id)}
                              className="opacity-0 group-hover/item:opacity-100 p-2 rounded-lg hover:bg-destructive/10 transition-all ml-2">
                              <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// ── Data ──

const DIGITAL_DECLUTTER: ChecklistGroup[] = [
  { title: 'Phone & Tablet', items: [
    { id: 'dd1', label: 'Delete unused apps' },
    { id: 'dd2', label: 'Clear photo gallery \u2014 keep only favorites' },
    { id: 'dd3', label: 'Unsubscribe from 10 email lists' },
    { id: 'dd4', label: 'Organize home screen into folders' },
    { id: 'dd5', label: 'Turn off unnecessary notifications' },
  ]},
  { title: 'Computer & Desktop', items: [
    { id: 'dd6', label: 'Clear desktop \u2014 move to organized folders' },
    { id: 'dd7', label: 'Empty downloads folder' },
    { id: 'dd8', label: 'Clear browser bookmarks & tabs' },
    { id: 'dd9', label: 'Run disk cleanup / clear caches' },
    { id: 'dd10', label: 'Update all software & OS' },
  ]},
  { title: 'Cloud & Accounts', items: [
    { id: 'dd11', label: 'Review & close unused subscriptions' },
    { id: 'dd12', label: 'Clean up cloud storage (Drive, Dropbox)' },
    { id: 'dd13', label: 'Update passwords for key accounts' },
    { id: 'dd14', label: 'Back up important files' },
    { id: 'dd15', label: 'Organize email into labels/folders' },
  ]},
];

const SPEED_CLEANING: ChecklistGroup[] = [
  { title: '20-Minute Blitz', items: [
    { id: 'sc1', label: 'Min 1-3: Grab bag, toss obvious trash room-by-room' },
    { id: 'sc2', label: 'Min 4-6: Return all out-of-place items' },
    { id: 'sc3', label: 'Min 7-9: Wipe all visible counters & tables' },
    { id: 'sc4', label: 'Min 10-12: Quick bathroom wipe (sink, mirror, toilet)' },
    { id: 'sc5', label: 'Min 13-15: Vacuum high-traffic areas only' },
    { id: 'sc6', label: 'Min 16-18: Straighten pillows, fold blankets' },
    { id: 'sc7', label: 'Min 19-20: Take out trash \u2014 done!' },
  ]},
  { title: '10-Minute Panic Clean', items: [
    { id: 'sc8', label: 'Grab a laundry basket \u2014 toss clutter in it' },
    { id: 'sc9', label: 'Wipe kitchen counter & table' },
    { id: 'sc10', label: 'Spray & wipe bathroom mirror + toilet seat' },
    { id: 'sc11', label: 'Fluff pillows, straighten throw blankets' },
    { id: 'sc12', label: 'Sweep/vacuum entryway only' },
    { id: 'sc13', label: 'Light a candle \u2014 instant clean vibes' },
  ]},
];

const MOVE_IN_OUT: ChecklistGroup[] = [
  { title: 'Move-Out Cleaning', items: [
    { id: 'mo1', label: 'Remove all personal items & trash' },
    { id: 'mo2', label: 'Patch nail holes & touch up paint' },
    { id: 'mo3', label: 'Deep clean oven, stovetop & range hood' },
    { id: 'mo4', label: 'Clean inside all cabinets & drawers' },
    { id: 'mo5', label: 'Scrub all bathrooms (toilet, tub, sink)' },
    { id: 'mo6', label: 'Clean all windows inside & out' },
    { id: 'mo7', label: 'Vacuum & mop all floors' },
    { id: 'mo8', label: 'Clean light fixtures & ceiling fans' },
    { id: 'mo9', label: 'Wipe baseboards & door frames' },
    { id: 'mo10', label: 'Clean garage / storage areas' },
  ]},
  { title: 'Move-In Prep', items: [
    { id: 'mi1', label: 'Sanitize all counters & surfaces' },
    { id: 'mi2', label: 'Clean inside all cabinets before unpacking' },
    { id: 'mi3', label: 'Deep clean bathrooms' },
    { id: 'mi4', label: 'Vacuum & mop all floors' },
    { id: 'mi5', label: 'Change all locks / re-key' },
    { id: 'mi6', label: 'Check smoke & CO detectors' },
    { id: 'mi7', label: 'Replace HVAC filters' },
    { id: 'mi8', label: 'Set up cleaning supplies station' },
  ]},
];

type SpecialtyTab = 'digital' | 'speed' | 'move';

const TAB_CONFIG: { id: SpecialtyTab; label: string; icon: typeof Monitor; data: ChecklistGroup[] }[] = [
  { id: 'digital', label: 'Digital Declutter', icon: Monitor, data: DIGITAL_DECLUTTER },
  { id: 'speed', label: 'Speed Cleaning', icon: Zap, data: SPEED_CLEANING },
  { id: 'move', label: 'Move In/Out', icon: Truck, data: MOVE_IN_OUT },
];

interface SpecialtyChecklistsProps {
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  customItems?: CustomSpecialtyItem[];
  onAddCustomItem?: (category: string, label: string) => void;
  onDeleteCustomItem?: (itemId: string) => void;
}

const SpecialtyChecklists = memo(function SpecialtyChecklists({ checked, onToggle, customItems = [], onAddCustomItem, onDeleteCustomItem }: SpecialtyChecklistsProps) {
  const [activeTab, setActiveTab] = useState<SpecialtyTab>('digital');
  const [showComplete, setShowComplete] = useState(false);
  const [addingInTab, setAddingInTab] = useState<SpecialtyTab | null>(null);
  const [newItemLabel, setNewItemLabel] = useState('');

  // Map tab IDs to category names for custom items
  const tabToCategoryMap: Record<SpecialtyTab, string> = {
    digital: 'digital-declutter',
    speed: 'speed-clean',
    move: 'move-in-out',
  };

  const currentConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;

  // Get custom items for current category
  const customItemsForTab = customItems.filter((item) => item.category === tabToCategoryMap[activeTab]);

  // Combine default and custom items
  const allGroups = [
    ...currentConfig.data,
    customItemsForTab.length > 0 ? { title: 'Custom Items', items: customItemsForTab.map((item) => ({ id: item.id, label: item.label })) } : null,
  ].filter(Boolean) as ChecklistGroup[];

  const allItems = allGroups.flatMap((g) => g.items);
  const doneCount = allItems.filter((i) => checked[i.id]).length;
  const pct = allItems.length > 0 ? Math.round((doneCount / allItems.length) * 100) : 0;

  const handleToggle = (id: string) => {
    const wasDone = checked[id];
    onToggle(id);

    if (!wasDone) {
      const newDone = doneCount + 1;
      if (newDone === allItems.length && allItems.length > 0) {
        setShowComplete(true);
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 }, colors: ['hsl(350 45% 75%)', 'hsl(210 50% 75%)', 'hsl(270 35% 75%)', 'hsl(165 40% 75%)'] });
        toast.success('Section Complete!', { description: 'You crushed it!' });
        setTimeout(() => setShowComplete(false), 3000);
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {showComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-3" style={{ color: 'hsl(45 60% 75%)' }} />
              <p className="text-2xl font-display font-bold text-foreground">Section Complete!</p>
              <p className="text-base text-muted-foreground mt-1">You crushed it!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 flex-wrap">
        {TAB_CONFIG.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all ${
                activeTab === tab.id ? 'shadow-md' : 'glass-panel text-foreground hover:bg-secondary/60'
              }`}
              style={activeTab === tab.id ? { background: 'hsl(270 35% 75%)', color: 'white' } : undefined}>
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-display font-semibold text-foreground">{currentConfig.label} Progress</span>
          <span className="text-xs text-muted-foreground">{doneCount}/{allItems.length} &bull; {pct}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--muted))' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(210 50% 75%), hsl(270 35% 75%))' }} />
        </div>
      </div>

      <InteractiveChecklist
        key={activeTab}
        groups={allGroups}
        checked={checked}
        onToggle={handleToggle}
        customItemIds={customItemsForTab.map((item) => item.id)}
        onDeleteCustomItem={onDeleteCustomItem}
      />

      {/* Add custom item form */}
      <div className="glass-panel rounded-2xl p-5 mt-6">
        <AnimatePresence mode="wait">
          {addingInTab === activeTab ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (newItemLabel.trim() && onAddCustomItem) {
                        onAddCustomItem(tabToCategoryMap[activeTab], newItemLabel);
                        setNewItemLabel('');
                        setAddingInTab(null);
                        toast.success('Item added!');
                      }
                    }
                  }}
                  placeholder="Add custom item..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  style={{ background: 'hsl(270 35% 75% / 0.1)', borderColor: 'hsl(270 35% 75% / 0.3)' }}
                />
                <button
                  onClick={() => {
                    if (newItemLabel.trim() && onAddCustomItem) {
                      onAddCustomItem(tabToCategoryMap[activeTab], newItemLabel);
                      setNewItemLabel('');
                      setAddingInTab(null);
                      toast.success('Item added!');
                    }
                  }}
                  className="px-4 py-2 text-xs rounded-lg font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'hsl(270 35% 75%)' }}>
                  Add
                </button>
                <button
                  onClick={() => {
                    setNewItemLabel('');
                    setAddingInTab(null);
                  }}
                  className="px-4 py-2 text-xs rounded-lg font-medium transition-colors text-muted-foreground/70"
                  style={{ background: 'rgba(80, 90, 120, 0.1)', border: '1px solid rgba(80, 90, 120, 0.2)' }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddingInTab(activeTab)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ color: 'hsl(220 15% 40%)', background: 'rgba(80, 90, 120, 0.12)', border: '1px solid rgba(80, 90, 120, 0.15)' }}>
              <Plus className="w-3.5 h-3.5" /> Add custom item
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default SpecialtyChecklists;