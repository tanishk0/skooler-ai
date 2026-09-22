/**
 * Application Design System Colors
 * Extracted from redesign palette specifications.
 */

export const COLORS = {
  /**
   * Primary (#4E342E)
   * Used for brand, buttons, highlights
   */
  primary: '#4E342E',

  /**
   * Secondary (#8D6E63)
   * Used for accents, icons, illustrations
   */
  secondary: '#8D6E63',

  /**
   * Background (#FDF8F3)
   * Main app background
   */
  background: '#FDF8F3',

  /**
   * Accent (#F4A261)
   * CTAs, highlights, progress
   */
  accent: '#F4A261',

  /**
   * Success (#6B8F71)
   * Success states, good progress
   */
  success: '#6B8F71',

  /**
   * Error (#E57373)
   * Errors, warnings
   */
  error: '#E57373',

  /**
   * Info (#64B5F6)
   * Links, info states
   */
  info: '#64B5F6',
} as const;

export type ColorKey = keyof typeof COLORS;
