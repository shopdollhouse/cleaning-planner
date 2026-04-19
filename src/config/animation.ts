/**
 * Animation configuration respecting user accessibility preferences
 * Returns Framer Motion props that respect prefers-reduced-motion
 */

export function getAnimationConfig(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      // Instant transitions when motion is not preferred
      fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0 } },
      slideUp: { initial: { y: 10 }, animate: { y: 0 }, transition: { duration: 0 } },
      slideDown: { initial: { y: -10 }, animate: { y: 0 }, transition: { duration: 0 } },
      scaleIn: { initial: { scale: 0.9 }, animate: { scale: 1 }, transition: { duration: 0 } },
      bounce: { type: 'spring', stiffness: 300, damping: 10 }, // Still spring for responsiveness, but instant
    };
  }

  // Normal animations
  return {
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.35 } },
    slideUp: { initial: { y: 10 }, animate: { y: 0 }, transition: { duration: 0.3 } },
    slideDown: { initial: { y: -10 }, animate: { y: 0 }, transition: { duration: 0.3 } },
    scaleIn: { initial: { scale: 0.9 }, animate: { scale: 1 }, transition: { duration: 0.2 } },
    bounce: { type: 'spring', stiffness: 300, damping: 25 },
  };
}
