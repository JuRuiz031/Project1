import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { CalendarService } from '../../../shared/services/calendar.service';

import { PollDTO } from '../../../shared/models/polls/poll.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';

@Component({
  selector: 'app-view-poll-modal',
  standalone: true,
  imports: [CommonModule, BaseModal],
  templateUrl: './view-poll-modal.html',
  styleUrls: ['./view-poll-modal.css'],
})
export class ViewPollModal implements OnInit {
  private calendarService = inject(CalendarService);

  title = input<string>('View Poll');
  pollId = input<string>(''); // required

  close = output<void>();
  edit = output<string>();

  poll = signal<PollDTO | null>(null);
  apiError = signal('');
  isLoading = signal(false);

  ngOnInit(): void {
    const id = (this.pollId() || '').trim();
    if (!id) {
      this.apiError.set('Missing poll id.');
      return;
    }
    this.load(id);
  }

  private load(id: string): void {
    this.apiError.set('');
    this.isLoading.set(true);

    this.calendarService.getByPollIds([id]).subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        this.isLoading.set(false);

        const found = (res.polls ?? []).find(p => p.poll_id === id) ?? (res.polls?.[0] ?? null);

        if (!found) {
          this.apiError.set('Poll not found.');
          this.poll.set(null);
          return;
        }

        this.poll.set(found);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.apiError.set(
          err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            'Could not load poll'
        );
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    const p = this.poll();
    if (!p) return;
    this.edit.emit(p.poll_id);
  }

  // Optional helpers for template display
  formatLocalDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  formatLocalTime(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`;
  }
}
