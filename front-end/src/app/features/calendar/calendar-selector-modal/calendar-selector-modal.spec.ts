import { describe, it, expect } from 'vitest';
import { CalendarSelectorModal } from './calendar-selector-modal';

describe('CalendarSelectorModal', () => {
  it('should create', () => {
    const cmp = new CalendarSelectorModal();
    expect(cmp).toBeTruthy();
  });
});
