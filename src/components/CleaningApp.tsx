import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X as CloseX, Search } from 'lucide-react';

import { useAppState, type TimePeriod } from '@/hooks/useAppState';
import { useAppActions } from '@/hooks/useAppActions';
import { TIME_PERIODS, type View, type SidebarMode } from '@/config/navigation';

import WelcomeCard from '@/components/WelcomeCard';
import WelcomeModal from '@/components/WelcomeModal';
import { FamilyHubOnboarding } from '@/components/FamilyHubOnboarding';
import { SectionExplainer } from '@/components/SectionExplainer';
import DaySelector from '@/components/DaySelector';
import TaskCard from '@/components/TaskCard';
import RoomGallery from '@/components/RoomGallery';
import FamilyHub from '@/components/FamilyHub';
import SettingsPanel from '@/components/SettingsPanel';
import StickyNotes from '@/components/StickyNotes';
import ThirtyDayChallenge from '@/components/ThirtyDayChallenge';
import SpecialtyChecklists from '@/components/SpecialtyChecklists';
import { useTimer } from '@/components/FloatingTimer';
import StuckButton from '@/components/StuckButton';
import AppHeader from '@/components/AppHeader';
import AppSidebar from '@/components/AppSidebar';
import BrandFooter from '@/components/BrandFooter';
import QuickStartPanel from '@/components/QuickStartPanel';
import HeroicDeedsLog from '@/components/HeroicDeedsLog';

import { getDeepCleanRooms } from '@/data/deepCleanRooms';

function getCurrentTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const ViewSection = memo(function ViewSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      {children}
    </motion.div>
  );
});

const SectionHeader = memo(function SectionHeader({ title, sub, color }: { title: string; sub?: string; color?: string }) {
  return (
    <div className="mb-6">
      <h2
        className="font-display text-2xl md:text-3xl font-semibold tracking-[0.04em]"
        style={{ color: color || 'hsl(var(--primary))' }}
      >
        {title}
      </h2>
      {sub && <p className="text-sm font-sans text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
});

interface CleaningAppProps {
  activeView: View;
  onChangeView: (v: View) => void;
}

export default function CleaningApp({ activeView, onChangeView }: CleaningAppProps) {
  const app = useAppState();
  const actions = useAppActions(app);
  const { state } = app;

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expanded');
  const [zenMode, setZenMode] = useState(false);
  const [visualNoiseFilter, setVisualNoiseFilter] = useState(false);

  const timer = useTimer(300);
  const rooms = getDeepCleanRooms();
  const currentPeriod = getCurrentTimePeriod();

  const handleToggleSidebar = useCallback(() => {
    setSidebarMode((m) => (m === 'expanded' ? 'collapsed' : 'expanded'));
  }, []);

  const handleToggleZen = useCallback(() => {
    setZenMode((v) => !v);
  }, []);

  const handleToggleVisualNoiseFilter = useCallback(() => {
    setVisualNoiseFilter((v) => !v);
  }, []);

  const handleSelectView = useCallback((view: View) => {
    onChangeView(view);
  }, [onChangeView]);

  const zenTask = useMemo(() => {
    if (state.quickStartTask) return state.quickStartTask.label;
    const periods: TimePeriod[] = ['morning', 'afternoon', 'evening'];
    for (const p of periods) {
      const t = state.dailyTasks[p].find((task) => !task.completed);
      if (t) return t.label;
    }
    return null;
  }, [state.quickStartTask, state.dailyTasks]);

  // Auto-scroll to top when switching views
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeModal />

      <AppHeader
        userName={state.userName}
        uiMode={state.uiMode}
        brainDump={state.brainDump}
        zenMode={zenMode}
        visualNoiseFilter={visualNoiseFilter}
        timerActive={timer.timerActive}
        timeRemaining={timer.timeRemaining}
        onSetUiMode={actions.system.setUiMode}
        onPickRandomDay={actions.system.pickRandomDay}
        onAddBrainDump={actions.notes.addBrainDump}
        onDeleteBrainDump={actions.notes.deleteBrainDump}
        onClearBrainDump={actions.notes.clearBrainDump}
        onToggleSidebar={handleToggleSidebar}
        onToggleZen={handleToggleZen}
        onToggleVisualNoiseFilter={handleToggleVisualNoiseFilter}
        onToggleTimer={timer.toggleTimer}
      />

      <div className="flex flex-1 min-h-0">
        <AppSidebar
          activeView={activeView}
          onSelectView={handleSelectView}
          mode={sidebarMode}
          soundEnabled={state.soundEnabled}
          onToggleSound={actions.system.toggleSound}
          timerActive={timer.timerActive}
          timeRemaining={timer.timeRemaining}
          totalSeconds={timer.totalSeconds}
          onToggleTimer={timer.toggleTimer}
          onSetTimerDuration={timer.setDuration}
          onResetTimer={timer.resetTimer}
        />

        <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-8 py-8 transition-all duration-300 ease-in-out" style={{ transitionProperty: 'margin-left, padding-left' }}>
          <AnimatePresence mode="wait">
            {activeView === 'daily' && (
              <ViewSection key="daily">
                {state.uiMode !== 'rest' && (
                  <>
                    <WelcomeCard
                      day={state.day}
                      userName={state.userName}
                      streakCount={state.streakCount}
                      totalTasksCompleted={state.totalTasksCompleted}
                    />
                    <DaySelector currentDay={state.day} onSelectDay={actions.system.setDay} />
                  </>
                )}

                {state.uiMode === 'rest' && (
                  <div className="mb-6 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
                    <h2 className="font-display text-xl font-semibold text-foreground mb-1">Take it easy, {state.userName || 'friend'}.</h2>
                    <p className="text-sm text-muted-foreground">Do what you can. Rest is productive too.</p>
                  </div>
                )}

                {state.uiMode !== 'rest' && (
                  <QuickStartPanel
                    task={state.quickStartTask}
                    onPick={actions.system.pickQuickStartTask}
                    onComplete={actions.daily.toggleDailyTask}
                    onClear={actions.system.clearQuickStartTask}
                  />
                )}

                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-2">
                    <SectionHeader title={`${state.day} Routine`} sub={state.uiMode === 'rest' ? 'No pressure. Do one, or none.' : 'Check off each task as you go — small wins add up.'} />
                    {state.uiMode !== 'rest' && <div className="ml-auto"><StuckButton /></div>}
                  </div>

                  {state.uiMode !== 'rest' && (
                    <SectionExplainer
                      title="Stuck? Get a Random Tip"
                      explanation="The 'Stuck?' button fires off a random cleaning hack to unstick decision paralysis. It's designed specifically for ADHD brains — when you can't pick a task, let randomness help. Click the refresh icon to try another tip."
                      tips={[
                        "Tips include tiny wins (pick up 3 items), timers, body doubling prompts",
                        "Works on executive function blockers: perfectionism, time anxiety, choice paralysis",
                        "No judgment — 'done' beats 'perfect' every time"
                      ]}
                      storageKey="explainer_stuck_button"
                    />
                  )}

                  {TIME_PERIODS.map((period) => (
                    <TaskCard
                      key={period}
                      period={period}
                      tasks={state.dailyTasks[period]}
                      onToggle={actions.daily.toggleDailyTask}
                      onAdd={state.uiMode === 'rest' ? undefined : actions.daily.addDailyTask}
                      onDelete={state.uiMode === 'rest' ? undefined : actions.daily.deleteDailyTask}
                      onEdit={state.uiMode === 'rest' ? undefined : actions.daily.editDailyTask}
                      isCurrentFocus={period === currentPeriod}
                      soundEnabled={state.soundEnabled}
                      isRestMode={state.uiMode === 'rest'}
                    />
                  ))}
                </div>

                {state.uiMode !== 'rest' && (
                  <div className="mt-8">
                    <HeroicDeedsLog deeds={state.heroicDeeds} />
                  </div>
                )}

                <BrandFooter />
              </ViewSection>
            )}

            {activeView === 'deep-clean' && (
              <ViewSection key="deep-clean">
                <SectionHeader title="Deep Clean" sub="Focus on one room at a time. Mini-Win groups keep it manageable." />
                <SectionExplainer
                  title="How Deep Clean Works"
                  explanation="Pick a room or maintenance task. Tasks are grouped into 3-task 'Mini-Wins' so it's not overwhelming. Maintenance rooms (monthly, quarterly, etc.) auto-reset on their schedule."
                  tips={[
                    "Rooms tab: Pick any room to deep clean",
                    "Challenges tab: Themed cleaning mini-challenges",
                    "Maintenance tab: Recurring deep-clean schedules"
                  ]}
                  storageKey="explainer_deep_clean"
                />
                <RoomGallery
                  rooms={rooms}
                  tasks={state.deepCleanTasks}
                  onToggle={actions.deep.toggleDeepTask}
                  onAdd={actions.deep.addDeepTask}
                  onDelete={actions.deep.deleteDeepTask}
                  onReset={actions.deep.resetDeepRoom}
                  soundEnabled={state.soundEnabled}
                  maintenanceRecurrence={state.maintenanceRecurrence}
                  onCompleteMaintenanceRoom={actions.deep.completeMaintenanceRoom}
                />
                <BrandFooter />
              </ViewSection>
            )}

            {activeView === 'challenges' && (
              <ViewSection key="challenges">
                <SectionHeader title="30-Day Challenge" sub="One task per day. Rest days included. You've got this." />
                <SectionExplainer
                  title="Building Habits"
                  explanation="Pick a tiny task for each day — make your bed, do 5 minutes of dishes, whatever counts as a win. Rest days included because burnout isn't motivating. Track your streak to celebrate consistency."
                  tips={[
                    "Skip a day if you need to — consistency beats perfection",
                    "Tasks can be as small as 'put on cleaning clothes'",
                    "Rest days rebuild motivation and prevent burnout"
                  ]}
                  storageKey="explainer_challenge"
                />
                <ThirtyDayChallenge
                  completed={state.challengeDays}
                  onToggle={actions.challenge.toggleChallengeDay}
                />
                <BrandFooter />
              </ViewSection>
            )}

            {activeView === 'specialty' && (
              <ViewSection key="specialty">
                <SectionHeader title="Specialty Checklists" sub="Digital declutter, speed cleaning, and move-in/out guides." />
                <SectionExplainer
                  title="Specialty Power Modes"
                  explanation="Pre-structured checklists for specific cleaning challenges. Use these when you need focused, time-bounded cleaning with a clear end point."
                  tips={[
                    "Digital Declutter: Organize phone, computer, cloud storage in 10-20 min blitzes",
                    "Speed Cleaning: Fast surface-level cleaning when time is tight",
                    "Moving Prep: Checklists for moving in or out"
                  ]}
                  storageKey="explainer_specialty"
                />
                <SpecialtyChecklists
                  checked={state.specialtyChecked}
                  onToggle={actions.challenge.toggleSpecialtyItem}
                  customItems={state.customSpecialtyItems}
                  onAddCustomItem={actions.challenge.addCustomSpecialtyItem}
                  onDeleteCustomItem={actions.challenge.deleteCustomSpecialtyItem}
                />
                <BrandFooter />
              </ViewSection>
            )}

            {activeView === 'family-hub' && (
              <ViewSection key="family-hub">
                <FamilyHubOnboarding
                  familySize={state.familySize}
                  onComplete={() => {}}
                />
                <SectionHeader title="Family Hub" sub="Assign tasks, run a leaderboard, and body-double together." />
                <FamilyHub
                  familySize={state.familySize}
                  tasks={state.familyTasks}
                  familyMembers={state.familyMembers}
                  activeMemberIds={state.activeMemberIds}
                  vouchers={state.vouchers}
                  onSetSize={actions.family.setFamilySize}
                  onToggleTask={actions.family.toggleFamilyTask}
                  onAddTask={actions.family.addFamilyTask}
                  onDeleteTask={actions.family.deleteFamilyTask}
                  onUpdateMember={actions.family.updateFamilyMember}
                  onToggleActiveMember={actions.family.toggleActiveMember}
                  onSwapTasks={actions.family.swapTasks}
                  onIssueVoucher={actions.family.issueVoucher}
                  onRedeemVoucher={actions.family.redeemVoucher}
                  onDeleteVoucher={actions.family.deleteVoucher}
                />
                <BrandFooter />
              </ViewSection>
            )}

            {activeView === 'notes' && (
              <ViewSection key="notes">
                <SectionHeader title="Sticky Notes" sub="7 pages for brain dumps, shopping, meal plans, and more. Auto-saved." />
                <SectionExplainer
                  title="Brain Dump + Lists"
                  explanation="Get thoughts out of your head instantly. Each note page saves automatically — no button needed. Perfect for random tasks, shopping lists, or meal planning. ADHD brains work better when they're not storing information."
                  tips={[
                    "Page 1: Brain dump — capture every stray thought",
                    "Pages 2-7: Your choice — shopping, meals, ideas, etc.",
                    "Changes auto-save — no 'save' button needed"
                  ]}
                  storageKey="explainer_notes"
                />
                <StickyNotes
                  notes={state.notes}
                  onUpdateNote={actions.notes.updateNote}
                />
                <BrandFooter />
              </ViewSection>
            )}

            {activeView === 'settings' && (
              <ViewSection key="settings">
                <SectionHeader title="Settings" sub="Personalise, back up your data, and read the FAQ." color="hsl(160 60% 75%)" />
                <SettingsPanel
                  state={state}
                  onSetUserName={actions.system.setUserName}
                  onToggleTips={actions.system.toggleShowTips}
                  onRestore={actions.system.restore}
                  onReset={actions.system.factoryReset}
                  onToggleSound={actions.system.toggleSound}
                  onSetDay={actions.system.setDay}
                />
                <BrandFooter />
              </ViewSection>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {visualNoiseFilter && (
          <motion.div
            key="noise-filter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] pointer-events-none"
            style={{
              backdropFilter: 'blur(24px) saturate(0.4)',
              WebkitBackdropFilter: 'blur(24px) saturate(0.4)',
              background: 'rgba(0, 0, 0, 0.05)',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zenMode && (
          <motion.div
            key="zen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
            style={{ background: 'rgba(45, 28, 58, 0.68)', backdropFilter: 'blur(32px)' }}
            onClick={handleToggleZen}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full text-center p-10 rounded-3xl"
              style={{
                background: 'rgba(255, 248, 252, 0.14)',
                backdropFilter: 'blur(36px) saturate(140%)',
                WebkitBackdropFilter: 'blur(36px) saturate(140%)',
                border: '1px solid rgba(255, 220, 235, 0.40)',
                boxShadow: '0 12px 48px rgba(183, 110, 121, 0.30), 0 2px 8px rgba(183,110,121,0.15)',
              }}
            >
              <button
                onClick={handleToggleZen}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close Visual Breath"
              >
                <CloseX className="w-4 h-4 text-white/70" />
              </button>

              <Wind className="w-8 h-8 mx-auto mb-4 text-white/60" />
              <h2 className="font-display text-3xl text-white/90 mb-2" style={{ fontWeight: 300, letterSpacing: '0.06em', fontStyle: 'italic' }}>
                Visual Breath
              </h2>
              <p className="text-white/50 text-xs font-sans uppercase tracking-[0.22em] mb-8">
                One thing at a time
              </p>

              {zenTask ? (
                <div
                  className="rounded-2xl p-6 mb-6"
                  style={{
                    background: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.50)',
                  }}
                >
                  <p className="text-[10px] font-sans uppercase tracking-[0.28em] text-white/50 mb-3">Your next task</p>
                  <p className="font-display text-xl text-white/95 leading-snug" style={{ fontWeight: 400, letterSpacing: '0.02em' }}>
                    {zenTask}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.50)' }}>
                  <p className="font-display text-xl text-white/80" style={{ fontWeight: 300, fontStyle: 'italic' }}>
                    All tasks complete ✨
                  </p>
                </div>
              )}

              <p className="text-white/40 text-xs font-sans leading-relaxed">
                Take three slow breaths.<br />You are doing beautifully.
              </p>

              <button
                onClick={handleToggleZen}
                className="mt-8 px-8 py-3 rounded-xl text-sm font-sans font-semibold text-white/80 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.30)' }}
              >
                Return to app
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
