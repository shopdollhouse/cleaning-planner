import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { HelpCircle, BookOpen, Timer, Sunrise, Users, Home, StickyNote, Download, Zap, Crown, Sparkles, Wind, Filter } from 'lucide-react';

const GUIDE_SECTIONS = [
  {
    icon: Sparkles,
    color: 'hsl(350 45% 75%)',
    bg: 'rgba(234, 193, 200, 0.3)',
    title: 'Getting Started',
    text: 'Welcome to your ADHD-friendly cleaning sanctuary! Start with Daily Routines to build momentum, then explore Deep Clean for bigger projects. Use the timer to beat paralysis, and don\'t forget to celebrate every win — your brain needs the dopamine hit.',
    tips: ['Start with ONE section', 'Set a timer even if it\'s just 5 minutes', 'Mark tasks complete to feel the progress'],
  },
  {
    icon: Timer,
    color: 'hsl(210 50% 75%)',
    bg: 'rgba(206, 217, 243, 0.3)',
    title: 'Gentle Focus Timer',
    text: 'Use the 5–25 minute presets to beat "Task Paralysis." Pick ONE task, start the timer, and ride the momentum. The progress ring fills as you go — small wins stack up fast. Your ADHD brain loves a countdown.',
    tips: ['Start with 5 minutes — you can always add more', 'Pair one timer with one task only', 'The sound cue helps signal "done" to your brain'],
  },
  {
    icon: Sunrise,
    color: 'hsl(45 60% 75%)',
    bg: 'rgba(242, 228, 179, 0.3)',
    title: 'Daily Reset at 4 AM',
    text: 'Every day at 4 AM, all daily tasks automatically uncheck. No shame from yesterday — every morning is a clean slate. This is designed for ADHD brains that struggle with "falling behind."',
    tips: ['You never have to manually reset', 'Your custom tasks stay — only checkmarks clear', 'Think of it as your daily fresh start ritual'],
  },
  {
    icon: Home,
    color: 'hsl(165 40% 75%)',
    bg: 'rgba(191, 221, 218, 0.3)',
    title: 'Room-by-Room Deep Clean',
    text: 'Use Deep Clean to focus on ONE room at a time. 22 rooms to choose from, organized into Rooms, Challenges, and Maintenance tiers. Tasks are grouped into "Mini-Wins" (3 tasks max) so you never feel overwhelmed.',
    tips: ['Pick the room that bugs you most — start there', 'Use the timer for 5-minute burst sessions per room', 'Add custom tasks with the + button to match your space'],
  },
  {
    icon: Users,
    color: 'hsl(270 35% 75%)',
    bg: 'rgba(223, 198, 228, 0.3)',
    title: 'Family Hub & Team Tracking',
    text: "Add family members and customize their avatars. Assign tasks, track progress, and celebrate wins together. The leaderboard shows who's winning, and the Champion Crown rotates to keep everyone motivated.",
    tips: ['Assign age-appropriate tasks to each member', 'Kids love seeing their progress bar fill up', 'Use Body Doubling mode when cleaning together'],
  },
  {
    icon: StickyNote,
    color: 'hsl(340 35% 75%)',
    bg: 'rgba(229, 193, 211, 0.3)',
    title: 'Sticky Notes & Brain Dumps',
    text: '7 color-coded pages for capturing thoughts: brain dumps, shopping lists, meal plans, weekly goals, reminders, and cleaning notes. Notes save as you type — no "save" button needed.',
    tips: ['Use "Brain Dump" for ADHD thought overflow', 'The "Meal Plan" page saves time at the store', 'Capture ideas to free up mental space'],
  },
  {
    icon: Wind,
    color: 'hsl(210 50% 75%)',
    bg: 'rgba(206, 217, 243, 0.3)',
    title: 'Focus Modes (Dim & Filter)',
    text: 'Dim (Visual Breath) darkens everything except your current task. Filter reduces visual noise. Toggle either anytime to reduce sensory overload and hyperfocus on what matters.',
    tips: ['Use Dim for deep work sessions', 'Use Filter when you\'re feeling overwhelmed', 'Toggle in the header — no context switching needed'],
  },
  {
    icon: Filter,
    color: 'hsl(45 60% 75%)',
    bg: 'rgba(242, 228, 179, 0.3)',
    title: 'UI Modes (Standard, Focus, Dopamine, Rest)',
    text: 'Switch UI modes based on your energy level. Standard = balanced. Focus = minimal distractions. Dopamine = maximum sparkle and rewards. Rest = gentle mode for low-energy days.',
    tips: ['Start with Standard until you find your vibe', 'Switch modes anytime without losing progress', 'Dopamine mode makes task completion feel like a celebration'],
  },
  {
    icon: Download,
    color: 'hsl(340 35% 75%)',
    bg: 'rgba(229, 193, 211, 0.3)',
    title: 'Backup & Restore',
    text: 'Export your entire planner as JSON from Settings. Import it on any device to pick up right where you left off. Your progress, custom tasks, notes, and family setup all transfer.',
    tips: ['Back up weekly — it takes 2 seconds', 'Great for switching devices or sharing setups', 'Keep a backup before trying new things'],
  },
  {
    icon: Zap,
    color: 'hsl(160 60% 75%)',
    bg: 'rgba(214, 224, 204, 0.3)',
    title: 'Specialty Checklists',
    text: 'Three power modes: Digital Decluttering for your devices, Speed Cleaning for time-limited blitzes (10 and 20 minute versions), and Move-In/Out for life transitions. Each has its own progress tracker.',
    tips: ['Speed Clean before guests arrive — it works!', 'Digital Declutter once a month keeps devices fast', 'Move checklists prevent security deposit losses'],
  },
];

const HowToDrawer = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold font-sans bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/40" style={{ color: '#2D2D3D' }}>
          <HelpCircle className="w-3.5 h-3.5" style={{ color: '#2D2D3D' }} />
          <span>How to Use</span>
        </button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-80 glass-panel">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-display">
            <BookOpen className="w-4 h-4 text-primary" />
            How to Use
          </SheetTitle>
          <p className="text-xs text-muted-foreground font-sans mt-1">
            Designed for ADHD brains — every feature fights executive dysfunction.
          </p>
        </SheetHeader>

        <div className="space-y-3 mt-4">
          {GUIDE_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.title} className="rounded-lg overflow-hidden" style={{ backgroundColor: section.bg }}>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${section.color}22` }}>
                      <SectionIcon className="w-4 h-4" style={{ color: section.color }} />
                    </div>
                    <h4 className="text-xs font-display font-semibold" style={{ color: '#2D2D3D' }}>{section.title}</h4>
                  </div>
                  <p className="text-xs font-sans leading-relaxed mb-2" style={{ color: '#2D2D3D' }}>{section.text}</p>
                  <div className="space-y-1.5">
                    {section.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-[10px] mt-0.5" style={{ color: section.color }}>✦</span>
                        <span className="text-[10px] font-sans leading-relaxed" style={{ color: '#2D2D3D' }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center font-sans">
            Made with 💜 by The Dollhouse Studio
          </p>
          <p className="text-[10px] text-muted-foreground/60 text-center font-sans mt-2">
            Remember: Progress {'>'} Perfection. You've got this! ✨
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HowToDrawer;
