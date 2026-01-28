import { Component, input, output, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  eventSelected = output<string>();  // Emit event ID instead of navigating
  closeModal = output<void>();

  // State
  searchQuery = signal('');

  // Computed: filter events by search query (title, description, or calendar name)
  filteredEvents = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.events();
    return this.events().filter(e =>
      e.title.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query) ||
      e.calendar_name?.toLowerCase().includes(query)
    );
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
}
