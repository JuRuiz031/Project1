import { Component, OnInit, inject, signal } from '@angular/core';
import { CalendarService } from '../../../../../shared/services/calendar.service';
import { PollDTO } from '../../../../../shared/models/polls/poll.dto';
import { CalendarHomeDTO } from '../../../../../shared/models/calendars/calendar-home.dto';
import { CommonModule } from '@angular/common';
import { ViewPollModal } from '../../../../poll/view-poll-modal/view-poll-modal';
import { CreatePollModal } from '../../../../poll/create-poll-modal/create-poll-modal';
import { EditPollModal } from '../../../../poll/edit-poll-modal/edit-poll-modal';


@Component({
  selector: 'app-polls-window',
  standalone: true,
  imports: [CommonModule, ViewPollModal, CreatePollModal, EditPollModal],
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
  selectedPollId = signal('');

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

  // onEditPoll(pollId: string): void {
  //   this.isViewPollOpen.set(false);
  //   // Later: open edit modal or route
  //   // this.router.navigate(['/edit-poll', pollId]);
  // }

  formatEventTime(iso: string): string {
    if (!iso) return '';

    const d = this.parseServerInstant(iso);
    if (isNaN(d.getTime())) return '';

    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    
    return `${date} ${time}`;
  }

    private parseServerInstant(iso: string): Date {
    const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);
    return new Date(hasTz ? iso : `${iso}Z`);
  }

  getTimezoneAbbr(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart?.value ?? 'UTC';
  }

  isEditPollOpen = signal(false);

openEditPoll(pollId: string) {
  const id = (pollId || '').trim();
  if (!id) {
    this.apiError.set('Missing poll id.');
    return;
  }

  this.selectedPollId.set(id);
  this.isViewPollOpen.set(false);
  this.isEditPollOpen.set(true);
}

onPollSaved(pollId: string) {
  this.isEditPollOpen.set(false);
  this.selectedPollId.set(pollId);
  this.isViewPollOpen.set(true);
  // this.loadPolls(); // optional
}

onPollDeleted(_pollId: string) {
  this.isEditPollOpen.set(false);
  this.isViewPollOpen.set(false);
  this.selectedPollId.set('');
  // this.loadPolls(); // optional
}

closeViewPoll() { this.isViewPollOpen.set(false); }
closeEditPoll() { this.isEditPollOpen.set(false); }



}
