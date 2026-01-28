import { Component, input, output, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CALENDAR_COLOR_PALETTE } from '../calendar-display/calendar-colors';

type CalendarOption = { calendar_id: string; name: string };

type EventDTO = {
  event_id: string;
  calendar_id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  notes?: string;
  tags: string[];
  calendar_name?: string;
};

@Component({
  selector: 'app-event-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-selector-modal.html',
  styleUrl: './event-selector-modal.css',
})
export class EventSelectorModal implements OnDestroy {
  // Inputs & Outputs
  events = input<EventDTO[]>([]);
  calendars = input<CalendarOption[]>([]);
  eventSelected = output<string>();  // Emit event ID instead of navigating
  closeModal = output<void>();

  // State
  searchQuery = signal('');
  selectedTags = signal<string[]>([]);
  selectedCalendarIds = signal<string[]>([]);

  // Color map for calendars
  colorMap = new Map<string, { primary: string; secondary: string }>();

  // Computed: extract all unique tags from events
  allTags = computed(() => {
    const tagSet = new Set<string>();
    this.events().forEach(e => {
      e.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  // Computed: filter events by search query (title, description, calendar name, or tags) AND selected tags AND selected calendars
  filteredEvents = computed(() => {
    let filtered = this.events();
    
    // Filter by selected calendars
    const selectedCals = this.selectedCalendarIds();
    if (selectedCals.length > 0) {
      filtered = filtered.filter(e => selectedCals.includes(e.calendar_id));
    }
    
    // Filter by selected tags (events must have ALL selected tags)
    const selected = this.selectedTags();
    if (selected.length > 0) {
      filtered = filtered.filter(e =>
        selected.every(tag => e.tags.includes(tag))
      );
    }
    
    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.calendar_name?.toLowerCase().includes(query) ||
        e.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  });

  constructor() {
    // Disable body scroll when modal opens
    document.body.style.overflow = 'hidden';

    // Build color map when calendars change
    effect(() => {
      this.colorMap.clear();
      this.calendars().forEach((c, index) => {
        this.colorMap.set(c.calendar_id, CALENDAR_COLOR_PALETTE[index % CALENDAR_COLOR_PALETTE.length]);
      });
    });
  }

  ngOnDestroy(): void {
    // Re-enable body scroll when modal closes
    document.body.style.overflow = '';
  }

  onEventSelect(eventId: string): void {
    this.eventSelected.emit(eventId);
  }

  onClose(): void {
    this.closeModal.emit();
  }

  toggleTag(tag: string): void {
    this.selectedTags.update(current => {
      if (current.includes(tag)) {
        return current.filter(t => t !== tag);
      } else {
        return [...current, tag];
      }
    });
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  clearTagFilters(): void {
    this.selectedTags.set([]);
  }

  toggleCalendar(calendarId: string): void {
    this.selectedCalendarIds.update(current => {
      if (current.includes(calendarId)) {
        return current.filter(id => id !== calendarId);
      } else {
        return [...current, calendarId];
      }
    });
  }

  isCalendarSelected(calendarId: string): boolean {
    return this.selectedCalendarIds().includes(calendarId);
  }

  clearCalendarFilters(): void {
    this.selectedCalendarIds.set([]);
  }

  getCalendarColor(calendarId: string): { primary: string; secondary: string } {
    return this.colorMap.get(calendarId) || { primary: '#666', secondary: '#eee' };
  }
}
