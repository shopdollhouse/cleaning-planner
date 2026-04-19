import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Sun, House, Users, FileText, Timer, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'dollhouse_welcomed';

const WelcomeModal = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const steps = [
    {
      title: 'Welcome to Your ADHD-Friendly Sanctuary',
      description: 'Let\'s make cleaning feel like a win. No guilt, no overwhelm — just small steps that add up. ✨',
      icon: Sparkles,
      color: 'hsl(350 45% 75%)',
    },
    {
      title: 'Daily Routines',
      description: 'Start with bite-sized morning, afternoon, and evening tasks. Check them off as you go — every win counts.',
      icon: Sun,
      color: 'hsl(350 45% 75%)',
    },
    {
      title: 'Deep Clean',
      description: 'Room-by-room deep cleaning with maintenance schedules. Pick a room and tackle it at your own pace.',
      icon: House,
      color: 'hsl(165 40% 75%)',
    },
    {
      title: 'Extra Tools & Family Hub',
      description: 'Specialty checklists for specific tasks, plus track family member contributions and avatar personalities.',
      icon: Users,
      color: 'hsl(270 35% 75%)',
    },
    {
      title: 'Stay Focused',
      description: 'Use the Gentle Timer to work in focused sprints. Keep Notes handy for brain dumps and meal plans. You\'ve got this! 🎉',
      icon: Timer,
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
              <button onClick={dismiss} className="absolute top-4 right-4 p-1.5 hover:bg-secondary rounded-lg transition-colors">
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
                className="flex justify-center mb-4"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${currentStep.color}20` }}
                >
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
                <h2 className="text-2xl font-display font-bold text-foreground mb-2" style={{ color: '#2D2D3D' }}>
                  {currentStep.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {currentStep.description}
                </p>
              </motion.div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-muted-foreground/20 text-foreground font-medium hover:bg-white/20 transition-colors text-sm"
                  >
                    Back
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity text-sm"
                    style={{ background: currentStep.color }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={dismiss}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
                    style={{ background: currentStep.color }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Let's Get Started
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
