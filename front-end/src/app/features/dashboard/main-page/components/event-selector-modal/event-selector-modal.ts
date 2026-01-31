import { Component, input, output, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getCalendarColor } from '../../../../../config/calendar-colors';

type CalendarOption = { calendar_id: string; name: string };
type EventStatus = 'all' | 'upcoming' | 'past';

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
  showSuccessMessage = input<boolean>(false);
  successMessageText = input<string>('');
  eventSelected = output<string>();  // Emit event ID instead of navigating
  closeModal = output<void>();

  // State
  searchQuery = signal('');
  selectedTags = signal<string[]>([]);
  selectedCalendarIds = signal<string[]>([]);
  selectedStatus = signal<EventStatus>('all');

  // Computed: extract all unique tags from events
  allTags = computed(() => {
    const tagSet = new Set<string>();
    this.events().forEach(e => {
      e.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  // Computed: count events by status
  upcomingCount = computed(() => {
    const now = new Date();
    return this.events().filter(e => new Date(e.end_time) > now).length;
  });

  pastCount = computed(() => {
    const now = new Date();
    return this.events().filter(e => new Date(e.end_time) <= now).length;
  });

  // Computed: filter events by search query (title, description, calendar name, or tags) AND selected tags AND selected calendars AND status
  filteredEvents = computed(() => {
    const now = new Date();
    let filtered = this.events();
    
    // Filter by status
    const status = this.selectedStatus();
    if (status === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.end_time) > now);
    } else if (status === 'past') {
      filtered = filtered.filter(e => new Date(e.end_time) <= now);
    }
    
    // Filter by selected calendars
    const selectedCals = this.selectedCalendarIds();
    if (selectedCals.length > 0) {
      filtered = filtered.filter(e => selectedCals.includes(e.calendar_id));
    }
    
    // Filter by selected tags (events must have AT LEAST ONE selected tag)
    const selected = this.selectedTags();
    if (selected.length > 0) {
      filtered = filtered.filter(e =>
        selected.some(tag => e.tags.includes(tag))
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

  setStatusFilter(status: EventStatus): void {
    this.selectedStatus.set(status);
  }

  getCalendarColor(calendarId: string): { primary: string; secondary: string } {
    return getCalendarColor(calendarId);
  }

  /**
   * Convert ISO-8601 timestamp to local date and time for display
   */
  formatEventTime(iso: string): string {
    if (!iso) return '';

    // Backend sends local datetime without timezone info
    // Parse directly without timezone conversion
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';

    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const time = `${hours}:${minutes} ${ampm}`;
    
    return `${date} ${time}`;
  }
}
