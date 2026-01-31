import { Component, input, output, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getCalendarColor } from '../../../config/calendar-colors';
import { PollDTO } from '../../../shared/models/polls/poll.dto';

type CalendarOption = { calendar_id: string; name: string };
type PollStatus = 'all' | 'in-progress' | 'completed';

@Component({
  selector: 'app-poll-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poll-selector-modal.html',
  styleUrl: './poll-selector-modal.css',
})
export class PollSelectorModal implements OnDestroy {
  // Inputs & Outputs
  polls = input<PollDTO[]>([]);
  calendars = input<CalendarOption[]>([]);
  showSuccessMessage = input<boolean>(false);
  successMessageText = input<string>('');
  pollSelected = output<string>();  // Emit poll ID
  closeModal = output<void>();

  // State
  searchQuery = signal('');
  selectedTags = signal<string[]>([]);
  selectedCalendarIds = signal<string[]>([]);
  selectedStatus = signal<PollStatus>('all');

  // Computed: extract all unique tags from polls
  allTags = computed(() => {
    const tagSet = new Set<string>();
    this.polls().forEach(p => {
      p.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  // Computed: filter polls by search query, tags, calendars, and status
  filteredPolls = computed(() => {
    const now = new Date();
    let filtered = this.polls();
    
    // Filter by status
    const status = this.selectedStatus();
    if (status === 'in-progress') {
      filtered = filtered.filter(p => new Date(p.end_time) > now);
    } else if (status === 'completed') {
      filtered = filtered.filter(p => new Date(p.end_time) <= now);
    }
    
    // Filter by selected calendars
    const selectedCals = this.selectedCalendarIds();
    if (selectedCals.length > 0) {
      filtered = filtered.filter(p => selectedCals.includes(p.calendar_id));
    }
    
    // Filter by selected tags (polls must have AT LEAST ONE selected tag)
    const selected = this.selectedTags();
    if (selected.length > 0) {
      filtered = filtered.filter(p =>
        selected.some(tag => p.tags?.includes(tag))
      );
    }
    
    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort by end_time (soonest to end first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.end_time).getTime();
      const dateB = new Date(b.end_time).getTime();
      return dateA - dateB; // Ascending order - soonest first
    });
  });

  // Computed: count polls by status
  inProgressCount = computed(() => {
    const now = new Date();
    return this.polls().filter(p => new Date(p.end_time) > now).length;
  });

  completedCount = computed(() => {
    const now = new Date();
    return this.polls().filter(p => new Date(p.end_time) <= now).length;
  });

  constructor() {
    // Disable body scroll when modal opens
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Re-enable body scroll when modal closes
    document.body.style.overflow = '';
  }

  onPollSelect(pollId: string): void {
    this.pollSelected.emit(pollId);
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

  setStatusFilter(status: PollStatus): void {
    this.selectedStatus.set(status);
  }

  getCalendarColor(calendarId: string): { primary: string; secondary: string } {
    return getCalendarColor(calendarId);
  }

  /**
   * Convert ISO-8601 timestamp to local date and time for display
   */
  formatPollTime(iso: string): string {
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
