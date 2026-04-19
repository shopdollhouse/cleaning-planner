import confetti from 'canvas-confetti';

/**
 * Optimized confetti with performance controls
 */

let lastConfettiTime = 0;
const CONFETTI_THROTTLE = 3000; // 3 seconds minimum between confetti
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface OptimizedConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  duration?: number;
  throttle?: boolean;
}

/**
 * Fire confetti with performance optimizations
 */
export function fireOptimizedConfetti(options: OptimizedConfettiOptions = {}) {
  // Respect reduced motion preference
  if (PREFERS_REDUCED_MOTION) {
    return;
  }

  // Apply throttle if enabled
  if (options.throttle !== false) {
    const now = Date.now();
    if (now - lastConfettiTime < CONFETTI_THROTTLE) {
      return;
    }
    lastConfettiTime = now;
  }

  // Reduce particle count on low-end devices
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const isLowEnd = deviceMemory ? deviceMemory < 4 : false;
  const particleCount = isLowEnd ? 50 : (options.particleCount || 100);

  try {
    confetti({
      particleCount,
      spread: options.spread || 70,
      origin: {
        x: options.origin?.x ?? 0.5,
        y: options.origin?.y ?? 0.5,
      },
      colors: options.colors || [
        'hsl(350 45% 75%)', // Light Pink
        'hsl(210 50% 75%)', // Periwinkle
        'hsl(270 35% 75%)', // Lavender
        'hsl(165 40% 75%)', // Mint
        'hsl(45 60% 75%)',  // Pale Cream
      ],
      disableForReducedMotion: true,
    });
  } catch (error) {
    // Silently fail on error (confetti is non-critical)
    console.debug('Confetti failed:', error);
  }
}

/**
 * Fire confetti for task completion
 */
export function fireCompletionConfetti() {
  fireOptimizedConfetti({
    particleCount: 120,
    spread: 82,
    origin: { y: 0.5 },
  });
}

/**
 * Fire confetti for milestone achievement
 */
export function fireMilestoneConfetti() {
  fireOptimizedConfetti({
    particleCount: 200,
    spread: 100,
    duration: 3000,
  });
}

/**
 * Fire confetti for streak
 */
export function fireStreakConfetti() {
  fireOptimizedConfetti({
    particleCount: 80,
    spread: 60,
    colors: ['hsl(45 60% 75%)', 'hsl(350 45% 75%)'], // Fire colors
  });
}
