import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, CheckCircle2, Trophy, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'dollhouse_familyHubOnboarded';

interface FamilyHubOnboardingProps {
  familySize: number;
  onComplete: () => void;
}

export function FamilyHubOnboarding({ familySize, onComplete }: FamilyHubOnboardingProps) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (familySize > 1 && !localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, [familySize]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  };

  const steps = [
    {
      title: 'Family Hub: Clean Together',
      description: 'Assign chores to family members, track who completes tasks, and earn rewards together. Perfect for shared responsibility.',
      icon: Users,
      color: 'hsl(350 45% 75%)',
    },
    {
      title: '1. Set Up Your Family',
      description: 'Customize each member with their own name, avatar, and color. You\'ve already picked ' + familySize + ' people — nice!',
      icon: Users,
      color: 'hsl(210 50% 75%)',
    },
    {
      title: '2. Assign Daily Tasks',
      description: 'Give each person chores to complete. They can swap tasks with siblings if someone\'s stuck. Tasks auto-complete when all team members finish their 100%.',
      icon: CheckCircle2,
      color: 'hsl(165 40% 75%)',
    },
    {
      title: '3. Earn Reward Vouchers',
      description: 'When someone completes all their assigned tasks, they earn a Reward Voucher. Redeem it for screen time, dessert, or whatever motivates your crew.',
      icon: Sparkles,
      color: 'hsl(270 35% 75%)',
    },
    {
      title: '4. Body Doubling (Optional)',
      description: 'Show who\'s cleaning RIGHT NOW. Seeing others "live" helps ADHD brains stay focused — even in different rooms. It\'s called body doubling and it really works.',
      icon: Trophy,
      color: 'hsl(45 60% 75%)',
    },
  ];

  const currentStep = steps[step];
  const CurrentIcon = currentStep.icon;

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none"
          >
            <div className="glass-panel-strong rounded-3xl p-8 max-w-md mx-4 shadow-2xl pointer-events-auto">
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 p-1.5 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Close onboarding"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Step indicator */}
              <div className="flex justify-center gap-1.5 mb-6">
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 rounded-full"
                    animate={{
                      width: i === step ? 24 : 8,
                      background: i <= step ? currentStep.color : 'rgba(45,45,61,0.2)',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>

              {/* Icon */}
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center mb-6"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: currentStep.color + '30' }}>
                  <CurrentIcon className="w-8 h-8" style={{ color: currentStep.color }} />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                key={`content-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-display font-bold text-foreground mb-2">{currentStep.title}</h2>
                <p className="text-sm text-muted-foreground mb-6">{currentStep.description}</p>
              </motion.div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: step === 0 ? 'rgba(200, 180, 210, 0.1)' : 'rgba(200, 180, 210, 0.2)',
                    color: 'hsl(var(--charcoal))'
                  }}
                >
                  Back
                </button>

                {step < steps.length - 1 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ backgroundColor: currentStep.color }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={dismiss}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ backgroundColor: currentStep.color }}
                  >
                    Let's Go! 🎉
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
