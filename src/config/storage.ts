/**
 * Centralized storage key constants
 * Single source of truth for all localStorage operations
 */

export const STORAGE_KEYS = {
  // Main app state
  APP_STATE: 'dollhouse_appState',
  LAST_ENTRY: 'dollhouse_lastEntry',
  LAST_BACKUP: 'dollhouse_lastBackup',

  // Onboarding and UI
  WELCOME_SHOWN: 'dollhouse_welcomeShown',
  FAMILY_HUB_ONBOARDED: 'dollhouse_familyHubOnboarded',

  // Section explainers (dismissible)
  EXPLAINER_DEEP_CLEAN: 'explainer_deep_clean',
  EXPLAINER_SPECIALTY: 'explainer_specialty',
  EXPLAINER_CHALLENGE: 'explainer_challenge',
  EXPLAINER_NOTES: 'explainer_notes',
  EXPLAINER_STUCK_BUTTON: 'explainer_stuck_button',

  // UI preferences
  UI_ZEN_MODE: 'dollhouse_zenMode',
  UI_VISUAL_FILTER: 'dollhouse_visualFilter',
  SIDEBAR_MODE: 'dollhouse_sidebarMode',
  THEME: 'dollhouse_theme',
} as const;

// Days of week constant
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

// ID prefixes for secure ID generation
export const ID_PREFIXES = {
  TASK: 'task',
  DEED: 'deed',
  VOUCHER: 'voucher',
  TEMPLATE: 'template',
  FAMILY_TASK: 'ftask',
  CUSTOM_SPECIALTY: 'custom',
} as const;
