import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { PollService } from '../../../shared/services/poll.service';

// Use your actual DTO types if you have them:
type ViewPollVM = {
  pollId: string;
  calendarName: string;
  title: string;
  description?: string | null;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  options: string[];
  tags: string[];
};

@Component({
  selector: 'app-view-poll-modal',
  standalone: true,
  imports: [CommonModule, BaseModal],
  templateUrl: './view-poll-modal.html',
  styleUrls: ['./view-poll-modal.css'],
})
export class ViewPollModal implements OnInit {
  private pollService = inject(PollService);

  title = input<string>('View Poll');
  pollId = input<string>(''); // parent passes the id

  close = output<void>();
  edit = output<string>(); // emit pollId so parent can open edit modal or route

  poll = signal<ViewPollVM | null>(null);
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

    // Replace with your actual API call (getById, getPoll, etc.)
    this.pollService.getById(id).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);

        // Map your backend shape -> ViewPollVM
        // (Adjust these field names to match your response DTO.)
        const vm: ViewPollVM = {
          pollId: res.poll_id ?? res.pollId ?? id,
          calendarName: res.calendar_name ?? res.calendarName ?? '',
          title: res.title ?? '',
          description: res.description ?? null,
          startDate: res.startDate ?? res.start_date ?? '',
          startTime: res.startTime ?? res.start_time ?? '',
          endDate: res.endDate ?? res.end_date ?? '',
          endTime: res.endTime ?? res.end_time ?? '',
          options: (res.options ?? []).map((o: any) => o.description ?? o),
          tags: res.tags ?? [],
        };

        this.poll.set(vm);
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
    this.edit.emit(p.pollId);
  }
}
