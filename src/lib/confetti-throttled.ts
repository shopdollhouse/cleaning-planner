import confetti, { type Options } from 'canvas-confetti';
import { throttle } from './timing';

/**
 * Throttled confetti to prevent animation jank from rapid completions
 * Limits confetti to once per 500ms even if trigger called more frequently
 */
const throttledConfetti = throttle((options?: Options) => {
  confetti({
    particleCount: 110,
    spread: 85,
    origin: { y: 0.5 },
    disableForReducedMotion: true,
    ...options,
  });
}, 500);

export { throttledConfetti as confetti };
