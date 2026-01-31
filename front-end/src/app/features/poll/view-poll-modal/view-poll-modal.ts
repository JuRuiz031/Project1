import { Component, OnInit, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { PollService } from '../../../shared/services/poll.service';
import { PollDTO } from '../../../shared/models/polls/poll.dto';
import { VotePollDTO } from '../../../shared/models/polls/vote-poll.dto';
import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
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
  private pollService = inject(PollService);

  title = input<string>('View Poll');
  pollId = input<string>('');

  back = output<void>();
  close = output<void>();
  edit = output<string>();

  poll = signal<PollDTO | null>(null);
  calendarName = signal<string>('');   // ✅ add
  apiError = signal('');
  isLoading = signal(false);

  // voting state
  voteError = signal('');
  isVoting = signal(false);
  hasVoted = signal(false);

   // selection state
  selectedSingleOptionId = signal<number | null>(null);
  selectedMultiOptionIds = signal<number[]>([]);

  isLoggedIn = computed(() => !!this.getUserIdFromStorage());

  ngOnInit(): void {
    const id = (this.pollId() || '').trim();
    if (!id) {
      this.apiError.set('Missing poll id.');
      return;
    }

    // load poll first, then resolve calendar name
    this.loadPoll(id);
  }

  private loadPoll(id: string): void {
    this.apiError.set('');
    this.voteError.set('');
    this.isLoading.set(true);

    this.calendarService.getByPollIds([id]).subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        const found =
          (res.polls ?? []).find(p => p.poll_id === id) ??
          (res.polls?.[0] ?? null);

        if (!found) {
          this.isLoading.set(false);
          this.apiError.set('Poll not found.');
          this.poll.set(null);
          return;
        }

        this.poll.set(found);
        this.resolveCalendarName(found.calendar_id);

        // initialize selection defaults
        this.initSelectionFromPoll(found);

        this.isLoading.set(false);
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

  private initSelectionFromPoll(p: PollDTO): void {
    // reset selections when poll loads/reloads
    this.selectedSingleOptionId.set(null);
    this.selectedMultiOptionIds.set([]);

    // optional: preselect first option for single-vote polls
    if (!p.allow_multiple_votes && p.options?.length) {
      this.selectedSingleOptionId.set(p.options[0].option_id);
    }
  }

  private resolveCalendarName(calendarId: string): void {
    this.calendarName.set(''); // reset

    this.calendarService.getHomepage().subscribe({
      next: (home: CalendarHomeDTO) => {
        const match = (home.calendars ?? []).find(c => c.calendar_id === calendarId);
        this.calendarName.set(match?.name ?? calendarId); // fallback to id
      },
      error: () => {
        // fallback: just show id if homepage load fails
        this.calendarName.set(calendarId);
      },
    });
  }

  onBack(): void {
    this.back.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    const p = this.poll();
    if (!p) return;
    this.edit.emit(p.poll_id);
  }

formatLocalDate(iso: string): string {
  if (!iso) return '';
  // Backend sends local datetime without timezone info
  // Parse directly without timezone conversion
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';

  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

formatLocalTime(iso: string): string {
  if (!iso) return '';
  // Backend sends local datetime without timezone info
  // Parse directly without timezone conversion
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}


  // -------------------------
  // Auth helper
  // -------------------------
  private getUserIdFromStorage(): string | null {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.user_id ?? u?.id ?? null;
    } catch {
      return null;
    }
  }

  // -------------------------
  // Option selection handlers
  // -------------------------
  selectSingle(optionId: number): void {
    this.voteError.set('');
    this.selectedSingleOptionId.set(optionId);
  }

  toggleMulti(optionId: number): void {
    this.voteError.set('');
    const curr = this.selectedMultiOptionIds();
    const next = curr.includes(optionId)
      ? curr.filter(id => id !== optionId)
      : [...curr, optionId];
    this.selectedMultiOptionIds.set(next);
  }

  // vote counts
  getTotalVotesForOption(opt: { user_votes: string[] | null; guest_votes: string[] | null }): number {
    return (opt.user_votes?.length ?? 0) + (opt.guest_votes?.length ?? 0);
  }

  canShowResults(p: PollDTO): boolean {
    // show results if poll allows results visibility OR user has just voted
    return !!p.results_visible || this.hasVoted();
  }

  // -------------------------
  // Submit vote
  // -------------------------
  submitVote(): void {
    this.voteError.set('');

    const p = this.poll();
    if (!p) return;

    const userId = this.getUserIdFromStorage();
    if (!userId) {
      this.voteError.set('You must be logged in to vote.');
      return;
    }

    // build selected option ids
    const selected = p.allow_multiple_votes
      ? this.selectedMultiOptionIds()
      : (this.selectedSingleOptionId() !== null ? [this.selectedSingleOptionId()!] : []);

    if (selected.length === 0) {
      this.voteError.set('Please select at least one option.');
      return;
    }
    if (!p.allow_multiple_votes && selected.length !== 1) {
      this.voteError.set('This poll allows only one vote.');
      return;
    }

    const dto: VotePollDTO = {
      user_id: String(userId),
      calendar_id: String(p.calendar_id),
      options: selected,
    };

    this.isVoting.set(true);

    this.pollService.vote(p.poll_id, dto).subscribe({
      next: (updated: PollDTO) => {
        this.isVoting.set(false);
        this.hasVoted.set(true);
        this.poll.set(updated);

        // keep selection consistent after update
        if (!updated.allow_multiple_votes) {
          // keep single selection (or reset to first)
          const keep = selected[0] ?? (updated.options?.[0]?.option_id ?? null);
          this.selectedSingleOptionId.set(keep);
          this.selectedMultiOptionIds.set([]);
        } else {
          this.selectedMultiOptionIds.set(selected);
          this.selectedSingleOptionId.set(null);
        }
      },
      error: (err: any) => {
        this.isVoting.set(false);
        this.voteError.set(
          err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            'Could not submit vote'
        );
      },
    });
  }
}
