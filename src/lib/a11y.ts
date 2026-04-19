/**
 * Accessibility utilities for keyboard navigation and focus management
 */

import React from 'react';

export const A11Y_KEYS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
} as const;

/**
 * Handle keyboard shortcut (e.g., Ctrl+Z for undo)
 */
export function handleKeyboardShortcut(
  event: KeyboardEvent,
  key: string,
  modifier: 'ctrl' | 'cmd' | 'shift' | 'alt' = 'ctrl',
  callback: () => void
): boolean {
  const isModifierPressed =
    modifier === 'ctrl' ? event.ctrlKey :
    modifier === 'cmd' ? event.metaKey :
    modifier === 'shift' ? event.shiftKey :
    event.altKey;

  if (isModifierPressed && event.key.toLowerCase() === key.toLowerCase()) {
    event.preventDefault();
    callback();
    return true;
  }

  return false;
}

/**
 * Focus management helper
 */
export function focusElement(selector: string, offset: number = 0) {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    setTimeout(() => element.focus(), offset);
  }
}

/**
 * Trap focus within a modal/dialog
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [ref]);
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
