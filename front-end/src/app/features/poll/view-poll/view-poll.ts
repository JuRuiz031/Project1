import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InviteService } from '../../../shared/services/invite.service';
import { MainFooter } from '../../shared/main-footer/main-footer';
import { PollDTO } from '../../../shared/models/polls/poll.dto';
import { isPollInvite } from '../../../shared/models/invites/invite-details-response.dto';

/**
 * Guest poll viewing component (display-only)
 * Used when guests click on invite links to view poll details
 * Similar to ViewEvent but for polls - no voting functionality for guests
 */
@Component({
  selector: 'app-view-poll',
  standalone: true,
  imports: [CommonModule, RouterLink, MainFooter],
  templateUrl: './view-poll.html',
  styleUrls: ['./view-poll.css'],
})
export class ViewPoll implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inviteService = inject(InviteService);

  apiError = signal('');
  isLoading = signal(false);
  poll = signal<PollDTO | null>(null);

  ngOnInit(): void {
    // Check if data was passed via router state (from ViewEvent redirect)
    const navigation = this.router.getCurrentNavigation();
    const passedData = navigation?.extras?.state?.['pollData'] || history.state?.pollData;

    if (passedData && isPollInvite(passedData)) {
      // Data already fetched by ViewEvent, no need for API call
      console.log('[ViewPoll] Using pre-fetched poll data:', passedData);
      this.displayPoll(passedData);
      return;
    }

    // Fallback: load from token (for direct navigation to /polllink)
    // Guest expects invite token in query param
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log('[ViewPoll] Token from URL:', token);

    if (token) {
      this.loadPollByToken(token);
    } else {
      this.apiError.set('Missing invite token. Please use the invite link provided.');
    }
  }

  private loadPollByToken(token: string): void {
    this.apiError.set('');
    this.isLoading.set(true);
    console.log('[ViewPoll] Loading poll with token:', token);

    // Call the public invite endpoint: GET /api/v1/invitelink?token=xyz
    this.inviteService.getInviteDetails(token).subscribe({
      next: (details) => {
        console.log('[ViewPoll] Received details:', details);
        this.isLoading.set(false);
        if (!details) {
          this.apiError.set('Poll not found');
          return;
        }
        // Type guard: ensure this is a poll invite
        if (isPollInvite(details)) {
          console.log('[ViewPoll] Is poll invite, displaying...');
          this.displayPoll(details);
        } else {
          console.log('[ViewPoll] Not a poll invite');
          this.apiError.set('Invalid poll invite link');
        }
      },
      error: (err) => {
        console.error('[ViewPoll] Error loading poll:', err);
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

  private displayPoll(pollData: PollDTO): void {
    console.log('[ViewPoll] displayPoll called with:', pollData);
    this.poll.set(pollData);
  }

  // Date/time formatting
  formatLocalDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';

    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  formatLocalTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  isPollEnded(): boolean {
    const p = this.poll();
    if (!p || !p.end_time) return false;
    
    const now = new Date();
    const endTime = new Date(p.end_time);
    return now > endTime;
  }

  getWinningLabel(): string {
    return this.isPollEnded() ? '🏆 Winner' : '🏆 Leading';
  }

  getTotalVotesForOption(opt: { user_votes: string[] | null; guest_votes: string[] | null }): number {
    return (opt.user_votes?.length ?? 0) + (opt.guest_votes?.length ?? 0);
  }

  isWinningOption(optionId: number): boolean {
    const p = this.poll();
    if (!p || !p.options || p.options.length === 0) return false;

    const maxVotes = Math.max(...p.options.map(opt => this.getTotalVotesForOption(opt)));
    if (maxVotes === 0) return false;

    const thisOption = p.options.find(opt => opt.option_id === optionId);
    if (!thisOption) return false;

    return this.getTotalVotesForOption(thisOption) === maxVotes;
  }
}
