import { CalendarSummaryDTO } from './calendar-summary.dto';

/**
 * Response for GET /calendar (calendar homepage).
 * Used to populate the calendar selector and tag filters.
 */
export interface CalendarHomeDTO {
  calendars: CalendarSummaryDTO[];
  tags: string[];
}
