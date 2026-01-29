import { Component, input, output, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { getCalendarColor } from '../../../config/calendar-colors';

type CalendarOptionDTO = { calendar_id: string; name: string };

@Component({
  selector: 'app-calendar-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-selector-modal.html',
  styleUrl: './calendar-selector-modal.css',
})
export class CalendarSelectorModal implements OnDestroy {
  calendars = input<CalendarOptionDTO[]>([]);
  calendarActivated = output<string>();
  closeModal = output<void>();

  searchQuery = signal('');
  selectedCalendarId = signal<string | null>(null);

  filteredCalendars = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.calendars();
    return this.calendars().filter(c => c.name.toLowerCase().includes(query));
  });

  constructor() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  getColor(calendarId: string) {
    return getCalendarColor(calendarId);
  }

  onSelect(calendarId: string): void {
    this.selectedCalendarId.set(calendarId);
  }

  onActivate(calendarId: string): void {
    this.calendarActivated.emit(calendarId);
  }

  onClose(): void {
    this.closeModal.emit();
  }
}