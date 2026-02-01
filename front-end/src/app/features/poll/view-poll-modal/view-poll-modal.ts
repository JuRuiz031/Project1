import { Component, OnInit, inject, input, output, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';
import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { PollService } from '../../../shared/services/poll.service';
import { InviteService } from '../../../shared/services/invite.service';
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
export class ViewPollModal implements OnInit, OnDestroy {
  private calendarService = inject(CalendarService);
  private pollService = inject(PollService);
  private inviteService = inject(InviteService);

  constructor() {
    document.body.style.overflow = 'hidden';

    // Show notification when success message input is true
    effect(() => {
      const showSuccess = this.showSuccessMessage();
      if (showSuccess) {
        this.showNotification.set(true);
        setTimeout(() => this.showNotification.set(false), 3000);
      }
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  title = input<string>('View Poll');
  pollId = input<string>('');
  showSuccessMessage = input<boolean>(false);

  back = output<void>();
  close = output<void>();
  edit = output<string>();

  poll = signal<PollDTO | null>(null);
  calendarName = signal<string>('');   // ✅ add
  apiError = signal('');
  isLoading = signal(false);
  showNotification = signal(false);

  // Share popup state
  showSharePopup = signal(false);
  shareLink = signal<string>('');
  isGeneratingLink = signal(false);
  copySuccess = signal(false);

  // Admin calendars for permission checking
  private adminCalendarIds = signal<string[]>([]);
  canEdit = computed(() => {
    const p = this.poll();
    if (!p) return false;
    return this.adminCalendarIds().includes(p.calendar_id);
  });
  canShare = computed(() => this.canEdit()); // Same permissions as edit

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

    // check if user has already voted
    const userId = this.getUserIdFromStorage();
    if (userId) {
      const userHasVoted = this.checkIfUserVoted(p, userId);
      this.hasVoted.set(userHasVoted);
      
      // if user has voted, preselect their choices
      if (userHasVoted) {
        this.preselectUserVotes(p, userId);
      }
    }
  }

  private resolveCalendarName(calendarId: string): void {
    this.calendarName.set(''); // reset

    this.calendarService.getHomepage().subscribe({
      next: (home: CalendarHomeDTO) => {
        const match = (home.calendars ?? []).find(c => c.calendar_id === calendarId);
        this.calendarName.set(match?.name ?? calendarId); // fallback to id
        
        // Store admin calendar IDs for permission checking
        const adminIds = (home.calendars ?? [])
          .filter(c => c.is_admin)
          .map(c => c.calendar_id);
        this.adminCalendarIds.set(adminIds);
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

  /**
   * Check if the user has already voted in this poll
   */
  private checkIfUserVoted(p: PollDTO, userId: string): boolean {
    return (p.options ?? []).some(opt => 
      (opt.user_votes ?? []).includes(userId)
    );
  }

  /**
   * Preselect the options that the user has already voted for
   */
  private preselectUserVotes(p: PollDTO, userId: string): void {
    const votedOptions = (p.options ?? [])
      .filter(opt => (opt.user_votes ?? []).includes(userId))
      .map(opt => opt.option_id);

    if (!p.allow_multiple_votes && votedOptions.length > 0) {
      this.selectedSingleOptionId.set(votedOptions[0]);
    } else if (p.allow_multiple_votes) {
      this.selectedMultiOptionIds.set(votedOptions);
    }
  }

  // -------------------------
  // Option selection handlers
  // -------------------------
  isOptionSelected(optionId: number): boolean {
    const p = this.poll();
    if (!p) return false;
    
    if (p.allow_multiple_votes) {
      return this.selectedMultiOptionIds().includes(optionId);
    } else {
      return this.selectedSingleOptionId() === optionId;
    }
  }

  selectSingle(optionId: number): void {
    this.voteError.set('');
    // Toggle: if already selected, deselect it
    const current = this.selectedSingleOptionId();
    this.selectedSingleOptionId.set(current === optionId ? null : optionId);
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

  isWinningOption(optionId: number): boolean {
    const p = this.poll();
    if (!p || !p.options || p.options.length === 0) return false;

    // Calculate max votes
    const maxVotes = Math.max(...p.options.map(opt => this.getTotalVotesForOption(opt)));
    
    // If no votes yet, no winner
    if (maxVotes === 0) return false;

    // Check if this option has the max votes
    const thisOption = p.options.find(opt => opt.option_id === optionId);
    if (!thisOption) return false;

    return this.getTotalVotesForOption(thisOption) === maxVotes;
  }

  /**
   * Only show winning indicators if user has voted OR poll has ended
   */
  shouldShowWinningIndicator(): boolean {
    return this.hasVoted() || this.isPollEnded();
  }

  isPollEnded(): boolean {
    const p = this.poll();
    if (!p || !p.end_time) return false;
    
    const now = new Date();
    const endTime = new Date(p.end_time);
    return now > endTime;
  }

  getVoteLabel(): string {
    return '✓ Your Vote';
  }

  getWinningLabel(): string {
    return this.isPollEnded() ? '🏆 Winner' : '🏆 Leading';
  }

  getVotedAndWinningLabel(): string {
    return this.isPollEnded() ? '✓ Your Vote 🏆 Winner' : '✓ Your Vote 🏆 Leading';
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

    // Check if poll has expired
    if (this.isPollEnded()) {
      this.voteError.set('This poll has ended and is no longer accepting votes.');
      return;
    }

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

  onShare(): void {
    const p = this.poll();
    if (!p || !this.canShare()) return;

    // Show popup and start generating link
    this.showSharePopup.set(true);
    this.isGeneratingLink.set(true);
    this.shareLink.set('');
    this.copySuccess.set(false);

    // Generate expiration date (7 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    const expirationISO = expirationDate.toISOString();

    // Create invite link
    this.inviteService.createPollInvite(p.poll_id, expirationISO)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.shareLink.set(response.invite_link);
          this.isGeneratingLink.set(false);
        },
        error: (err) => {
          console.error('[ViewPollModal] Failed to generate invite link:', err);
          this.isGeneratingLink.set(false);
          this.apiError.set('Failed to generate invite link');
          this.showSharePopup.set(false);
        }
      });
  }

  closeSharePopup(): void {
    this.showSharePopup.set(false);
    this.shareLink.set('');
    this.copySuccess.set(false);
  }

  copyShareLink(): void {
    const link = this.shareLink();
    if (!link) return;

    navigator.clipboard.writeText(link).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    }).catch(err => {
      console.error('[ViewPollModal] Failed to copy link:', err);
    });
  }
}
