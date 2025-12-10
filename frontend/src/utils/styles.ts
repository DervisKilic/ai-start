/**
 * Shared Tailwind CSS class constants
 * 
 * This file contains commonly used class strings to follow DRY principles.
 * Use these constants instead of repeating class strings across components.
 */

// ============================================================================
// Form Input Styles
// ============================================================================

/** Base styles for form inputs (Input, Select, Textarea) */
export const formInputBase =
  'w-full px-4 py-3 bg-dark-800/60 backdrop-blur-sm border rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-[3px] focus:ring-warm-500/50 focus:border-warm-500/30 transition-all duration-200';

/** Border color for form inputs in normal state */
export const formInputBorderNormal = 'border-dark-600/60';

/** Border color for form inputs in error state */
export const formInputBorderError = 'border-red-500';

/** Helper function to get form input border class */
export const getFormInputBorder = (hasError: boolean): string =>
  hasError ? formInputBorderError : formInputBorderNormal;

// ============================================================================
// Form Label Styles
// ============================================================================

/** Base styles for form labels */
export const formLabel = 'block text-sm font-semibold text-dark-200 mb-2';

// ============================================================================
// Form Error Styles
// ============================================================================

/** Error message text styles */
export const formErrorText = 'text-sm text-red-400';

/** Error message container styles */
export const errorMessageContainer = 'bg-red-500/15 backdrop-blur-sm border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium shadow-md shadow-red-950/20';

// ============================================================================
// Navigation Styles
// ============================================================================

/** Active navigation link styles */
export const navLinkActive =
  'bg-warm-500/15 text-warm-400 border border-warm-500/30 shadow-lg shadow-warm-500/10 backdrop-blur-sm';

/** Inactive navigation link styles */
export const navLinkInactive = 'text-dark-300 hover:text-white hover:bg-dark-800/70 hover:backdrop-blur-sm';

/** Base navigation link styles */
export const navLinkBase =
  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-y-[-1px]';

// ============================================================================
// Container/Card Styles
// ============================================================================

/** Card container with background and border */
export const cardContainer = 'bg-dark-900/60 backdrop-blur-xl rounded-xl border border-dark-700/50 shadow-xl shadow-dark-950/20';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Combines class strings, filtering out empty strings
 */
export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');
