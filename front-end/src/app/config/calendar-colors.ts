/**
 * Color palette for distinguishing calendars visually.
 * Single source of truth for calendar colors across the app.
 */

export type CalendarColor = { primary: string; secondary: string };

export const CALENDAR_COLOR_PALETTE: CalendarColor[] = [
  // Original 20 (unchanged)
  { primary: '#1e90ff', secondary: '#d1e8ff' }, // Dodger Blue
  { primary: '#e3bc08', secondary: '#fdf1ba' }, // Gold
  { primary: '#ad2121', secondary: '#fae3e3' }, // Crimson
  { primary: '#1e8449', secondary: '#d4efdf' }, // Forest Green
  { primary: '#8e44ad', secondary: '#ebdef0' }, // Purple
  { primary: '#e67e22', secondary: '#fdebd0' }, // Orange
  { primary: '#16a085', secondary: '#d1f2eb' }, // Teal
  { primary: '#c0392b', secondary: '#fadbd8' }, // Dark Red
  { primary: '#2980b9', secondary: '#d4e6f1' }, // Steel Blue
  { primary: '#d35400', secondary: '#fbeee6' }, // Pumpkin
  { primary: '#27ae60', secondary: '#d5f5e3' }, // Emerald
  { primary: '#9b59b6', secondary: '#e8daef' }, // Amethyst
  { primary: '#e74c3c', secondary: '#fadbd8' }, // Alizarin
  { primary: '#34495e', secondary: '#d5d8dc' }, // Wet Asphalt
  { primary: '#f39c12', secondary: '#fdebd0' }, // Carrot
  { primary: '#1abc9c', secondary: '#d1f2eb' }, // Turquoise
  { primary: '#e91e63', secondary: '#fce4ec' }, // Pink
  { primary: '#3f51b5', secondary: '#e8eaf6' }, // Indigo
  { primary: '#009688', secondary: '#e0f2f1' }, // Cyan
  { primary: '#795548', secondary: '#efebe9' }, // Brown

  // Additional 10 (same tone & contrast style)
  { primary: '#5dade2', secondary: '#eaf2fb' }, // Light Blue
  { primary: '#52be80', secondary: '#eafaf1' }, // Soft Green
  { primary: '#f1948a', secondary: '#fdecea' }, // Coral
  { primary: '#a569bd', secondary: '#f4ecf7' }, // Soft Violet
  { primary: '#48c9b0', secondary: '#e8f8f5' }, // Aqua
  { primary: '#dc7633', secondary: '#fae5d3' }, // Burnt Orange
  { primary: '#85929e', secondary: '#f2f4f4' }, // Cool Gray
  { primary: '#f5b041', secondary: '#fef5e7' }, // Amber
  { primary: '#2e86c1', secondary: '#ebf5fb' }, // Deep Sky Blue
  { primary: '#922b21', secondary: '#f9ebea' }, // Wine Red
];

/**
 * Deterministically map a calendarId to a palette entry.
 * - Stable across components
 * - Independent of list order or event order
 */
export function getCalendarColor(calendarId: string | null | undefined): CalendarColor {
  if (!calendarId) return { primary: '#666', secondary: '#eee' };

  const idx = hashString(calendarId) % CALENDAR_COLOR_PALETTE.length;
  return CALENDAR_COLOR_PALETTE[idx];
}

/**
 * Fast, deterministic string hash (djb2-ish variant).
 * Returns an unsigned 32-bit integer.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i); // hash * 33 ^ c
  }
  return hash >>> 0;
}