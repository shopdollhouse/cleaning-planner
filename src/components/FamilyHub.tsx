import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StuckButton from '@/components/StuckButton';
import {
  CheckCircle2,
  Circle,
  Star,
  Trophy,
  Check,
  Crown,
  User,
  Baby,
  Users as UsersIcon,
  UserRound,
  UserPlus,
  Dog,
  Cat,
  Bird,
  PersonStanding,
  Rabbit,
  Radio,
  Ticket,
  ArrowLeftRight,
  X,
  Gift,
  Plus,
  Trash2,
  Users,
  Zap,
  Heart,
  Flower,
  Smile,
  Lightbulb,
  Shield,
  Award,
  Search,
  Ribbon,
} from 'lucide-react';

import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import type { FamilyMember, FamilyTask, RewardVoucher } from '@/hooks/useAppState';
import type { LucideIcon } from 'lucide-react';
import { sanitizeMemberName, sanitizeTaskLabel, sanitizeZone } from '@/lib/sanitize';

const QUICK_PICKS = ['Vacuum', 'Dust surfaces', 'Dishes', 'Wipe counters', 'Take out trash', 'Sweep floor', 'Mop floor', 'Tidy up'];


const AVAILABLE_ICONS: { id: string; label: string; icon: LucideIcon; category: string }[] = [
  { id: 'smile', label: '😊 Happy Face (Mom)', icon: Smile, category: 'Family' },
  { id: 'zap', label: '⚡ Energy (Dad)', icon: Zap, category: 'Family' },
  { id: 'heart', label: '💕 Heart', icon: Heart, category: 'Family' },
  { id: 'bow', label: '⭐ Star Sparkle', icon: Star, category: 'Family' },
  { id: 'star', label: '⭐ Star (Emma)', icon: Star, category: 'Kids' },
  { id: 'lightbulb', label: '💡 Bright Mind (Liam)', icon: Lightbulb, category: 'Kids' },
  { id: 'flower', label: '🌸 Pretty Flower', icon: Flower, category: 'Kids' },
  { id: 'baby', label: 'Baby', icon: Baby, category: 'Kids' },
  { id: 'dog', label: 'Dog', icon: Dog, category: 'Pets' },
  { id: 'cat', label: 'Cat', icon: Cat, category: 'Pets' },
  { id: 'bird', label: 'Bird', icon: Bird, category: 'Pets' },
  { id: 'hamster', label: 'Hamster', icon: Rabbit, category: 'Pets' },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(AVAILABLE_ICONS.map((icon) => [icon.id, icon.icon]));
Object.assign(ICON_MAP, { user: User, contact: UserRound, star: Star });

function getIconForMember(member: FamilyMember): LucideIcon {
  if (member.avatar && ICON_MAP[member.avatar]) return ICON_MAP[member.avatar];
  const lower = member.name.toLowerCase();
  if (lower.includes('dog') || lower.includes('pup') || lower.includes('buddy')) return Dog;
  if (lower.includes('cat') || lower.includes('kitty')) return Cat;
  if (lower.includes('bird') || lower.includes('parrot')) return Bird;
  if (lower.includes('baby')) return Baby;
  if (lower.includes('mom') || lower.includes('mum')) return User;
  if (lower.includes('dad')) return User;
  return PersonStanding;
}

const MEMBER_PASTELS = [
  { bg: 'rgba(230, 203, 214, 0.6)', border: 'hsl(350 45% 87%)', text: '#2D2D3D' },  // Light Pink
  { bg: 'rgba(217, 229, 240, 0.6)', border: 'hsl(210 50% 85%)', text: '#2D2D3D' },  // Periwinkle
  { bg: 'rgba(232, 217, 240, 0.6)', border: 'hsl(270 35% 85%)', text: '#2D2D3D' },  // Lavender
  { bg: 'rgba(217, 232, 227, 0.6)', border: 'hsl(165 40% 82%)', text: '#2D2D3D' },  // Mint Cyan
  { bg: 'rgba(245, 240, 219, 0.6)', border: 'hsl(45 60% 88%)', text: '#2D2D3D' },   // Pale Cream
  { bg: 'rgba(229, 194, 215, 0.6)', border: 'hsl(340 35% 85%)', text: '#2D2D3D' },  // Dusty Rose
];

const ICON_CATEGORIES = ['Family', 'Kids', 'Pets'] as const;

interface FamilyHubProps {
  familySize: number;
  tasks: FamilyTask[];
  familyMembers: FamilyMember[];
  activeMemberIds: string[];
  vouchers: RewardVoucher[];
  onSetSize: (size: number) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (memberId: string, label: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateMember: (memberId: string, updates: Partial<FamilyMember>) => void;
  onToggleActiveMember: (memberId: string) => void;
  onSwapTasks: (taskAId: string, taskBId: string) => void;
  onIssueVoucher: (memberId: string, memberName: string) => RewardVoucher;
  onRedeemVoucher: (voucherId: string) => void;
  onDeleteVoucher: (voucherId: string) => void;
}

function FamilyHub({
  familySize, tasks, familyMembers, activeMemberIds, vouchers,
  onSetSize, onToggleTask, onAddTask, onDeleteTask, onUpdateMember,
  onToggleActiveMember, onSwapTasks,
  onIssueVoucher, onRedeemVoucher, onDeleteVoucher,
}: FamilyHubProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [openPersonaId, setOpenPersonaId] = useState<string | null>(null);
  const [swapSourceTaskId, setSwapSourceTaskId] = useState<string | null>(null);
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [collapsedMembers, setCollapsedMembers] = useState<Set<string>>(new Set());

  const FAMILY_SIZES = [2, 3, 4, 5, 6];
  const visibleMembers = familyMembers.slice(0, familySize);

  const getMemberStats = (memberId: string) => {
    const memberTasks = tasks.filter((task) => task.assignedTo === memberId);
    const completed = memberTasks.filter((task) => task.completed).length;
    return { total: memberTasks.length, completed };
  };

  const totalTasks = tasks.filter(t => visibleMembers.some(m => m.id === t.assignedTo)).length;
  const totalDone = tasks.filter(t => visibleMembers.some(m => m.id === t.assignedTo) && t.completed).length;
  const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  const filteredQuickPicks = useMemo(() => {
    if (!addingTaskFor) return [];
    const memberTasks = tasks.filter(t => t.assignedTo === addingTaskFor);
    return QUICK_PICKS.filter(p =>
      p.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !memberTasks.some(t => t.label.toLowerCase() === p.toLowerCase())
    );
  }, [searchFilter, addingTaskFor, tasks]);

  const startEdit = (memberId: string, currentName: string) => {
    setEditingMember(memberId);
    setEditName(currentName);
  };

  const saveEdit = (memberId: string) => {
    const trimmed = editName.trim();
    if (trimmed) onUpdateMember(memberId, { name: sanitizeMemberName(trimmed) });
    setEditingMember(null);
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (task && !task.completed) {
      confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 }, colors: ['hsl(350 45% 87%)', 'hsl(165 40% 82%)', 'hsl(270 35% 85%)'], disableForReducedMotion: true });
    }
    onToggleTask(taskId);
    if (task && !task.completed) {
      const memberTasks = tasks.filter((item) => item.assignedTo === task.assignedTo);
      const newDone = memberTasks.filter((item) => (item.id === taskId ? true : item.completed)).length;
      if (newDone === memberTasks.length && memberTasks.length > 0) {
        const member = familyMembers.find((item) => item.id === task.assignedTo);
        const memberName = member?.name || 'Member';
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ['hsl(45 60% 88%)', 'hsl(350 45% 87%)', 'hsl(165 40% 82%)', 'hsl(270 35% 85%)'] });
        const voucher = onIssueVoucher(task.assignedTo, memberName);
        toast.success(`🏆 ${memberName} earned a Reward Voucher!`, { description: voucher.reward, duration: 6000 });
      }
    }
  };

  const submitNewTask = (memberId: string) => {
    const label = newTaskLabel.trim();
    if (label) { onAddTask(memberId, sanitizeTaskLabel(label)); toast.success('Task added!'); }
    setNewTaskLabel('');
    setSearchFilter('');
    setAddingTaskFor(null);
  };

  const toggleCollapse = (memberId: string) => {
    const newCollapsed = new Set(collapsedMembers);
    if (newCollapsed.has(memberId)) {
      newCollapsed.delete(memberId);
    } else {
      newCollapsed.add(memberId);
    }
    setCollapsedMembers(newCollapsed);
  };

  const openSwapFor = (taskId: string) => setSwapSourceTaskId(taskId);
  const closeSwap = () => setSwapSourceTaskId(null);
  const performSwap = (targetTaskId: string) => {
    if (!swapSourceTaskId) return;
    onSwapTasks(swapSourceTaskId, targetTaskId);
    toast.success('Swapped! 🔄', { description: 'Less paralysis, more progress.' });
    closeSwap();
  };

  const swapSourceTask = useMemo(() => tasks.find((t) => t.id === swapSourceTaskId) || null, [swapSourceTaskId, tasks]);
  const swapCandidates = useMemo(() => {
    if (!swapSourceTask) return [];
    return tasks.filter((t) =>
      t.id !== swapSourceTask.id &&
      t.assignedTo !== swapSourceTask.assignedTo &&
      !t.completed &&
      visibleMembers.some((m) => m.id === t.assignedTo),
    );
  }, [swapSourceTask, tasks, visibleMembers]);

  const leaderboard = [...visibleMembers]
    .map((member) => ({ ...member, ...getMemberStats(member.id) }))
    .sort((a, b) => b.completed - a.completed);

  const activeVouchers = vouchers.filter((v) => !v.redeemed);

  return (
    <div className="space-y-6">

      {/* ── Quick Start Guide ── */}
      <div className="rounded-3xl p-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(45, 200, 130, 0.08) 0%, rgba(200, 180, 210, 0.1) 100%)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <h3 className="text-lg font-display font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
          🚀 Quick Start: 3 Steps
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="p-4 rounded-xl" style={{ background: 'hsl(var(--card))' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" className="mb-2">
              <circle cx="20" cy="20" r="18" fill="hsl(210 50% 65%)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(210 50% 65%)" strokeWidth="0.5" opacity="0.4" />
              <text x="20" y="20" textAnchor="middle" dominantBaseline="middle" className="font-bold" fontSize="18" fill="white" fontFamily="DM Sans, system-ui, sans-serif">
                1
              </text>
            </svg>
            <p className="text-xs font-sans font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Add Members</p>
            <p className="text-[11px] text-muted-foreground">Pick how many people & customize their names + avatars</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'hsl(var(--card))' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" className="mb-2">
              <circle cx="20" cy="20" r="18" fill="hsl(165 40% 65%)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(165 40% 65%)" strokeWidth="0.5" opacity="0.4" />
              <text x="20" y="20" textAnchor="middle" dominantBaseline="middle" className="font-bold" fontSize="18" fill="white" fontFamily="DM Sans, system-ui, sans-serif">
                2
              </text>
            </svg>
            <p className="text-xs font-sans font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Assign Tasks</p>
            <p className="text-[11px] text-muted-foreground">Give each person chores to complete (see "Assigned Tasks" below)</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'hsl(var(--card))' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" className="mb-2">
              <circle cx="20" cy="20" r="18" fill="hsl(45 60% 65%)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(45 60% 65%)" strokeWidth="0.5" opacity="0.4" />
              <text x="20" y="20" textAnchor="middle" dominantBaseline="middle" className="font-bold" fontSize="18" fill="white" fontFamily="DM Sans, system-ui, sans-serif">
                3
              </text>
            </svg>
            <p className="text-xs font-sans font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Earn Rewards</p>
            <p className="text-[11px] text-muted-foreground">Finish 100% → earn a Reward Voucher to redeem</p>
          </div>
        </div>
      </div>

      {/* ── Family Size Selector - TOP ── */}
      <div className="rounded-3xl p-6 overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 100%)`, backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
            <h3 className="text-lg font-display font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Your Family
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold font-sans" style={{ color: 'hsl(270 35% 70%)' }}>{familySize} member{familySize !== 1 ? 's' : ''}</span>
            <StuckButton />
          </div>
        </div>

        {/* Visual Family Group */}
        <div className="mb-5 flex items-center justify-center gap-2 py-6">
          {visibleMembers.map((member, idx) => {
            const iconDef = AVAILABLE_ICONS.find(a => a.id === member.avatar);
            const IconComponent = iconDef?.icon || User;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${member.color}40, ${member.color}20)`, border: `3px solid ${member.color}`, boxShadow: `0 4px 12px ${member.color}30` }}>
                  <IconComponent className="w-10 h-10" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
                </div>
                <span className="text-[11px] font-sans font-semibold text-center max-w-16 truncate" style={{ color: 'hsl(var(--foreground))' }}>{member.name}</span>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs font-sans text-muted-foreground mb-4">
          How many family members are joining? Choose below, then customize each person.
        </p>

        <div className="flex gap-2 flex-wrap justify-center">
          {FAMILY_SIZES.map((size, index) => {
            const colors = ['hsl(350 45% 75%)', 'hsl(210 50% 75%)', 'hsl(270 35% 75%)', 'hsl(165 40% 75%)', 'hsl(45 60% 75%)'];
            return (
              <button
                key={size}
                onClick={() => onSetSize(size)}
                className={`w-12 h-12 rounded-xl text-base font-bold font-sans transition-all`}
                style={familySize === size ? { backgroundColor: colors[index], color: 'hsl(var(--foreground))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : { backgroundColor: 'rgba(255,255,255,0.5)', color: 'hsl(var(--foreground))' }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Today's Progress ── */}
      <div className="rounded-3xl p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
            <h3 className="text-sm font-display font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))' }}>
              Today's Progress
            </h3>
          </div>
          <span className="text-sm font-bold font-sans" style={{ color: 'hsl(var(--foreground))' }}>{overallPct}%</span>
        </div>
        <p className="text-xs font-sans text-muted-foreground mb-3">
          Combined family progress across all assigned tasks today.
        </p>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(200, 180, 210, 0.15)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(270 35% 75%), hsl(210 50% 75%))' }}
          />
        </div>
        <p className="text-[10px] font-sans text-muted-foreground mt-2">{totalDone} of {totalTasks} tasks done</p>
      </div>

      {/* ── Section 3: Reward Vouchers (MOVED TO TOP) ── */}
      {vouchers.length > 0 && (
        <div className="rounded-3xl p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
            <h3 className="text-sm font-display font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))' }}>
              Reward Vouchers
            </h3>
            <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[hsl(45 60% 75%)]/15 text-[hsl(45 60% 75%)]">
              {activeVouchers.length} active
            </span>
          </div>
          <p className="text-xs font-sans text-muted-foreground mb-4">
            Earned automatically when someone finishes 100% of their tasks. Print it out, stick it on the fridge, and redeem at family movie night — or make up your own rewards.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <AnimatePresence>
              {activeVouchers.slice(0, 8).map((v) => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative flex items-start gap-3 p-4 rounded-2xl border ${v.redeemed ? 'opacity-50' : ''}`}
                  style={{ borderColor: v.redeemed ? 'rgba(200, 180, 210, 0.2)' : 'rgba(212, 175, 55, 0.3)', backgroundColor: v.redeemed ? 'rgba(200, 180, 210, 0.05)' : 'rgba(212, 175, 55, 0.08)' }}
                >
                  <Gift className="w-6 h-6 shrink-0 mt-0.5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold font-sans" style={{ color: v.redeemed ? 'hsl(220 10% 55%)' : 'hsl(45 60% 65%)' }}>
                      {v.memberName}
                    </p>
                    <p className={`text-sm font-sans font-semibold leading-snug ${v.redeemed ? 'line-through' : ''}`} style={{ color: 'hsl(var(--foreground))' }}>
                      {v.reward}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {!v.redeemed && (
                        <button
                          onClick={() => { onRedeemVoucher(v.id); toast.success('Voucher redeemed 🎉'); }}
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#d0d0d0] text-[#2D2D3D] hover:opacity-90 transition-opacity"
                        >
                          Redeem
                        </button>
                      )}
                      <button onClick={() => onDeleteVoucher(v.id)} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-muted-foreground hover:text-destructive transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Section 4: Body Doubling ── */}
      <div className="rounded-3xl p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-5 h-5 animate-pulse" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))' }}>
            Cleaning Together · Body Doubling
          </h3>
        </div>
        <p className="text-xs font-sans text-muted-foreground mb-4">
          Mark who's cleaning right now. Seeing someone else "live" helps ADHD brains stay on task — even if you're in different rooms.
          It's called body doubling and it really works.
        </p>
        <div className="flex flex-wrap gap-2">
          {visibleMembers.map((member) => {
            const MemberIcon = getIconForMember(member);
            const isActive = activeMemberIds.includes(member.id);
            return (
              <button
                key={member.id}
                onClick={() => onToggleActiveMember(member.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${isActive ? 'shadow-md scale-105' : 'opacity-60 hover:opacity-100'}`}
                style={{
                  backgroundColor: isActive ? `${member.color}22` : 'hsl(220 14% 92%)',
                  border: isActive ? `2px solid ${member.color}` : '2px solid transparent',
                }}
                aria-pressed={isActive}
              >
                <span className="relative">
                  <MemberIcon className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
                  {isActive && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[hsl(165_100%_35%)] ring-2 ring-background animate-pulse" />}
                </span>
                <span className="text-xs font-sans font-bold" style={{ color: isActive ? member.color : 'hsl(220 10% 40%)' }}>
                  {member.name}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: isActive ? 'hsl(165 100% 30%)' : '#2D2D3D' }}>
                  {isActive ? 'Live' : 'Idle'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 4: Task Lists ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))' }}>
            Assigned Tasks
          </h3>
        </div>
        <p className="text-xs font-sans text-muted-foreground mb-4">
          Each person's task list lives here. Add tasks with +, complete them by tapping the circle, or swap with another member if you're stuck.
          Finishing 100% earns a Reward Voucher. 🎉
        </p>
        <div className={`grid gap-5 ${familySize <= 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {visibleMembers.map((member, index) => {
            const memberTasks = tasks.filter((task) => task.assignedTo === member.id);
            const MemberIcon = getIconForMember(member);
            const pastel = MEMBER_PASTELS[index % MEMBER_PASTELS.length];
            const doneCount = memberTasks.filter((task) => task.completed).length;
            const pct = memberTasks.length > 0 ? Math.round((doneCount / memberTasks.length) * 100) : 0;
            const isLive = activeMemberIds.includes(member.id);
            const existingLabels = new Set(memberTasks.map(t => t.label.toLowerCase()));
            const memberFilteredQuickPicks = QUICK_PICKS.filter(p =>
              p.toLowerCase().includes(searchFilter.toLowerCase()) &&
              !existingLabels.has(p.toLowerCase())
            );

            return (
              <motion.div key={member.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${pastel.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <div className="absolute top-0 right-0 h-full w-1" style={{ background: member.color }} />
                <button
                  onClick={() => toggleCollapse(member.id)}
                  className="w-full px-6 pt-5 pb-4 text-left hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: member.color, color: '#fff' }}>
                        <MemberIcon className="w-5 h-5" style={{ color: 'white' }} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-display font-bold" style={{ color: pastel.text }}>{member.name}'s Tasks</h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold font-sans shrink-0" style={{ color: pastel.text }}>{doneCount}/{memberTasks.length}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: pastel.border + '44' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: member.color }} />
                  </div>
                </button>

                <AnimatePresence initial={false} mode="wait">
                  {!collapsedMembers.has(member.id) && (
                    <motion.div
                      key="tasks"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: `${pastel.border}44` }}>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
                          <input
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="Search or add…"
                            aria-label={`Search quick tasks or type a new task for ${member.name}`}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border text-foreground placeholder:text-muted-foreground focus:outline-none"
                            style={{ backgroundColor: `${pastel.border}22`, borderColor: `${pastel.border}44`, color: 'hsl(var(--foreground))' }}
                          />
                        </div>
                        {memberFilteredQuickPicks.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {memberFilteredQuickPicks.map((pick) => (
                              <button
                                key={pick}
                                onClick={() => { onAddTask(member.id, pick); setSearchFilter(''); }}
                                className="px-2 py-1 text-xs rounded-lg font-semibold transition-all"
                                style={{ backgroundColor: `${pastel.border}44`, color: 'hsl(var(--foreground))', border: `1px solid ${pastel.border}66` }}
                              >
                                + {pick}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-1">
                        {memberTasks.length === 0 && addingTaskFor !== member.id && (
                          <p className="text-xs text-muted-foreground text-center py-4 font-sans">No tasks yet — tap + to add one</p>
                        )}
                        {memberTasks.map((task) => (
                          <div key={task.id} className={`group flex items-center gap-3 p-3 rounded-xl transition-all ${task.completed ? 'opacity-50' : ''}`} style={{ background: task.completed ? 'rgba(200, 180, 210, 0.08)' : 'transparent' }}>
                            <button onClick={() => handleToggleTask(task.id)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                              {task.completed
                                ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: pastel.text }} strokeWidth={1.8} />
                                : <Circle className="w-5 h-5 shrink-0" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />}
                              <span className={`text-sm font-sans truncate ${task.completed ? 'line-through' : ''}`} style={{ color: task.completed ? '#404040' : 'hsl(var(--charcoal))' }}>
                                {task.label}
                              </span>
                            </button>
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                              {!task.completed && (
                                <button onClick={() => openSwapFor(task.id)} className="p-1.5 rounded-lg transition-colors" style={{ ['--tw-bg-opacity' as string]: '1' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(270 40% 93%)')} onMouseLeave={(e) => (e.currentTarget.style.background = '')} title="Swap chore with another member">
                                  <ArrowLeftRight className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
                                </button>
                              )}
                              <button onClick={() => onDeleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                                <Trash2 className="w-5 h-5 text-destructive" strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <AnimatePresence initial={false} mode="wait">
                          {addingTaskFor === member.id && (
                            <motion.div
                              key="form"
                              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 mt-3">
                                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(200, 180, 210, 0.1)', border: '1px solid rgba(200, 180, 210, 0.2)' }}>
                                  <Search className="w-4 h-4" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
                                  <input
                                    autoFocus
                                    value={newTaskLabel}
                                    onChange={(e) => setNewTaskLabel(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') submitNewTask(member.id);
                                      if (e.key === 'Escape') { setAddingTaskFor(null); setNewTaskLabel(''); setSearchFilter(''); }
                                    }}
                                    placeholder="Search or type task…"
                                    className="flex-1 px-2 py-2 text-sm font-sans rounded-lg border focus:outline-none min-w-0"
                                    style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(200, 180, 210, 0.2)', color: 'hsl(var(--foreground))' }}
                                  />
                                  <button onClick={() => submitNewTask(member.id)} className="p-1.5 rounded-lg shrink-0 text-white transition-colors" style={{ backgroundColor: pastel.text }}>
                                    <Check className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
                                  </button>
                                  <button onClick={() => { setAddingTaskFor(null); setNewTaskLabel(''); setSearchFilter(''); }} className="p-1.5 rounded-lg shrink-0 hover:bg-secondary/60 transition-colors">
                                    <X className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
                                  </button>
                                </div>
                                {filteredQuickPicks.length > 0 && (
                                  <div className="px-1 grid grid-cols-2 gap-1.5">
                                    {filteredQuickPicks.map((pick) => (
                                      <button
                                        key={pick}
                                        onClick={() => { setNewTaskLabel(pick); submitNewTask(member.id); }}
                                        className="px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all text-left"
                                        style={{ background: 'rgba(200, 180, 210, 0.15)', border: `1px solid ${member.color}44`, color: 'hsl(var(--foreground))' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = `${member.color}22`)}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(200, 180, 210, 0.15)')}
                                      >
                                        {pick}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Section 5: Customize Members ── */}
      <div className="rounded-3xl p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4" style={{ color: 'hsl(270 35% 75%)' }} />
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))' }}>
            Customize Members
          </h3>
        </div>
        <p className="text-xs font-sans text-muted-foreground mb-5">
          Choose a fun avatar for each member and customize their name. Their icon and color appear throughout the app.
        </p>

        {/* Member cards with always-visible customization */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleMembers.map((member, index) => {
            const MemberIcon = getIconForMember(member);
            const isEditing = editingMember === member.id;
            const pastel = MEMBER_PASTELS[index % MEMBER_PASTELS.length];
            const stats = getMemberStats(member.id);
            const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            const iconDef = AVAILABLE_ICONS.find(a => a.id === member.avatar);

            return (
              <motion.div
                key={member.id}
                layout
                className="rounded-2xl overflow-hidden space-y-3 p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: `1px solid ${pastel.border}44`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
              >
                {/* Name and edit header */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(member.id)}
                        onBlur={() => saveEdit(member.id)}
                        className="px-2 py-1 text-sm font-sans font-bold rounded-lg bg-white/80 border border-border focus:outline-none focus:ring-2 focus:ring-primary w-full"
                        style={{ color: 'hsl(var(--foreground))' }}
                      />
                      <button onClick={() => saveEdit(member.id)} className="p-1 shrink-0">
                        <Check className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-sans font-bold block" style={{ color: pastel.text }}>{member.name}</span>
                      <button
                        onClick={() => startEdit(member.id, member.name)}
                        className="text-[10px] font-sans text-muted-foreground hover:underline"
                      >
                        Edit name
                      </button>
                    </>
                  )}
                </div>

                {/* Avatar Picker - Multiple Rows Per Category */}
                <div className="space-y-2.5 pt-2 border-t" style={{ borderColor: `${pastel.border}44` }}>
                  {ICON_CATEGORIES.map((category) => {
                    const icons = AVAILABLE_ICONS.filter((icon) => icon.category === category);
                    return (
                      <div key={category}>
                        <p className="text-[9px] font-sans uppercase tracking-wider mb-1.5 font-semibold" style={{ color: `${pastel.text}99` }}>{category}</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {icons.map((icon) => {
                            const isSelected = member.avatar === icon.id;
                            const IconComponent = icon.icon;
                            return (
                              <button
                                key={`${member.id}-${icon.id}-${member.avatar}`}
                                type="button"
                                onClick={() => onUpdateMember(member.id, { avatar: icon.id })}
                                className="h-9 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90"
                                style={{
                                  background: isSelected ? `linear-gradient(135deg, ${member.color}40, ${member.color}20)` : `linear-gradient(135deg, ${pastel.border}22, ${pastel.border}11)`,
                                  border: isSelected ? `3px solid ${member.color}` : `2px solid ${pastel.border}66`,
                                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                  boxShadow: isSelected ? `inset 0 0 0 1px ${member.color}, 0 2px 8px ${member.color}20` : `0 1px 4px rgba(0,0,0,0.1)`,
                                  transition: 'background 200ms ease, border 200ms ease, transform 200ms ease, box-shadow 200ms ease',
                                }}
                                title={icon.label}
                              >
                                <IconComponent className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Section 6: Leaderboard ── */}
      <div className="rounded-3xl p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
          <h3 className="text-lg font-display font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Family Leaderboard</h3>
        </div>
        <p className="text-xs font-sans text-muted-foreground mb-5">
          Rankings update live as tasks get ticked off. The gold crown goes to whoever's completed the most — a little friendly competition never hurt.
        </p>
        <div className="space-y-3">
          {leaderboard.map((member, index) => {
            const pct = member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0;
            const MemberIcon = getIconForMember(member);
            const isChampion = index === 0 && member.completed > 0;
            const medalColors = ['hsl(45 60% 75%)', 'hsl(210 50% 75%)', 'hsl(350 45% 75%)'];
            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all`}
                style={{ backgroundColor: isChampion ? 'rgba(242, 228, 179, 0.15)' : 'rgba(255,255,255,0.3)', border: `1px solid ${isChampion ? 'rgba(242, 228, 179, 0.3)' : 'rgba(200, 180, 210, 0.1)'}` }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
                  <circle cx="16" cy="16" r="15" fill={medalColors[index] || 'hsl(220 15% 80%)'} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <circle cx="16" cy="16" r="14" fill="none" stroke={medalColors[index] || 'hsl(220 15% 80%)'} strokeWidth="0.5" opacity="0.5" />
                  <text x="16" y="16" textAnchor="middle" dominantBaseline="middle" className="font-bold" fontSize="14" fill="white" fontFamily="DM Sans, system-ui, sans-serif">
                    {index + 1}
                  </text>
                </svg>
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: isChampion ? 'linear-gradient(135deg, rgba(242, 228, 179, 0.4), rgba(242, 228, 179, 0.15))' : `linear-gradient(135deg, ${member.color}40, ${member.color}20)`, boxShadow: isChampion ? '0 2px 8px rgba(242, 228, 179, 0.3)' : `0 2px 8px ${member.color}20` }}>
                  <MemberIcon className="w-7 h-7" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
                  {isChampion && <Crown className="w-5 h-5 absolute -top-1 -right-1 drop-shadow-md" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-sans font-bold truncate" style={{ color: 'hsl(var(--foreground))' }}>{member.name}</h4>
                    {isChampion && <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(242, 228, 179, 0.2)', color: 'hsl(45 60% 75%)' }}>Champion</span>}
                  </div>
                  <div className="w-full h-2.5 rounded-full mt-1.5 overflow-hidden" style={{ backgroundColor: '#2D2D3D10' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: isChampion ? 'linear-gradient(90deg, hsl(45 60% 75%), hsl(38 70% 70%))' : `linear-gradient(90deg, ${member.color}, ${member.color}88)` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
                  <span className="text-xs font-bold font-sans" style={{ color: 'hsl(var(--foreground))' }}>{member.completed}/{member.total}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>


      {/* Swap Modal */}
      <AnimatePresence>
        {swapSourceTask && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 backdrop-blur-md"
            style={{ background: 'rgba(45, 28, 58, 0.4)' }}
            onClick={closeSwap}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(200, 180, 210, 0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowLeftRight className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
                    <h3 className="text-lg font-display font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Chore Swap</h3>
                  </div>
                  <p className="text-xs font-sans text-muted-foreground">
                    Stuck or overwhelmed by this task? Trade it instantly with another member — no guilt, just momentum.
                  </p>
                </div>
                <button onClick={closeSwap} className="p-1 rounded-lg hover:bg-secondary/60 transition-colors">
                  <X className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
                </button>
              </div>
              <div className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(200, 180, 210, 0.12)', border: '1px solid rgba(200, 180, 210, 0.2)' }}>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 mb-1.5">Your task</p>
                <p className="text-sm font-sans font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{swapSourceTask.label}</p>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Pick a task to receive</p>
              {swapCandidates.length === 0 ? (
                <p className="text-sm font-sans text-muted-foreground text-center py-6">No swappable open tasks from other members right now.</p>
              ) : (
                <div className="space-y-2">
                  {swapCandidates.map((c) => {
                    const target = visibleMembers.find((m) => m.id === c.assignedTo);
                    const TargetIcon = target ? getIconForMember(target) : Circle;
                    return (
                      <button
                        key={c.id}
                        onClick={() => performSwap(c.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left"
                        style={{ background: 'hsl(var(--card))', border: '1px solid rgba(200, 180, 210, 0.2)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.7)', e.currentTarget.style.borderColor = 'rgba(200, 180, 210, 0.4)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.5)', e.currentTarget.style.borderColor = 'rgba(200, 180, 210, 0.2)')}
                      >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${target?.color || 'hsl(220 14% 80%)'}22` }}>
                          <TargetIcon className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: target?.color || 'hsl(220 10% 50%)' }}>{target?.name || 'Member'}</p>
                          <p className="text-sm font-sans font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>{c.label}</p>
                        </div>
                        <ArrowLeftRight className="w-5 h-5 shrink-0" style={{ color: 'hsl(var(--foreground))' }} strokeWidth={2} />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FamilyHub;
