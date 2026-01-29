import { Component, OnInit, inject, signal } from '@angular/core';
import { CalendarService } from '../../../../../shared/services/calendar.service';
import { PollDTO } from '../../../../../shared/models/polls/poll.dto';
import { CalendarHomeDTO } from '../../../../../shared/models/calendars/calendar-home.dto';
import { CommonModule } from '@angular/common';
import { ViewPollModal } from '../../../../poll/view-poll/view-poll-modal';
import { CreatePollModal } from '../../../../poll/create-poll-modal/create-poll-modal';

@Component({
  selector: 'app-polls-window',
  standalone: true,
  imports: [CommonModule, ViewPollModal, CreatePollModal],
  templateUrl: './polls-window.html',
  styleUrls: ['./polls-window.css'],
})
export class PollsWindow implements OnInit {
  private calendarService = inject(CalendarService);

  // modal state
  isCreatePollOpen = signal(false);
  isViewPollOpen = signal(false);

  // data state
  isLoading = signal(false);
  apiError = signal('');

  polls = signal<PollDTO[]>([]);
  selectedPollId = signal<string>('');

  ngOnInit(): void {
    this.loadPolls();
  }

  loadPolls(): void {
    this.apiError.set('');
    this.isLoading.set(true);

    this.calendarService.getHomepage().subscribe({
      next: (home: CalendarHomeDTO) => {
        const calendarIds = (home.calendars ?? []).map(c => c.calendar_id);

        if (calendarIds.length === 0) {
          this.isLoading.set(false);
          this.polls.set([]);
          return;
        }

        this.calendarService.getByCalendarIds(calendarIds).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            const list = res.polls ?? [];
            this.polls.set(list);

            // default-select first poll
            if (!this.selectedPollId() && list.length > 0) {
              this.selectedPollId.set(list[0].poll_id);
            }
          },
          error: (err: any) => {
            this.isLoading.set(false);
            this.apiError.set(
              err?.error?.message ||
                (typeof err?.error === 'string' ? err.error : '') ||
                err?.message ||
                'Could not load polls'
            );
          },
        });
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.apiError.set(
          err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            'Could not load calendars'
        );
      },
    });
  }

  onCreatePoll(): void {
    this.isCreatePollOpen.set(true);
  }

  onPollCreated(pollId: string): void {
    this.isCreatePollOpen.set(false);
    this.selectedPollId.set(pollId);
    this.isViewPollOpen.set(true);

    // refresh list so new poll appears
    this.loadPolls();
  }

  onSelectPoll(p: PollDTO): void {
    this.selectedPollId.set(p.poll_id);
  }

  onViewPoll(): void {
    if (!this.selectedPollId()) {
      this.apiError.set('Select a poll first.');
      return;
    }
    this.isViewPollOpen.set(true);
  }

  onEditPoll(pollId: string): void {
    this.isViewPollOpen.set(false);
    // Later: open edit modal or route
    // this.router.navigate(['/edit-poll', pollId]);
  }
}
