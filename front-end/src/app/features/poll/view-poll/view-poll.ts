import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarSummaryDTO } from '../../../shared/models/calendars/calendar-summary.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { PollDTO } from '../../../shared/models/polls/poll.dto';

type PollViewModel = {
  pollId: string;
  calendarId: string;
  calendarName: string;

  title: string;
  description: string;
  notes: string;

  startDate: string; // yyyy-mm-dd (LOCAL)
  startTime: string; // HH:mm (LOCAL)
  endDate: string;
  endTime: string;

  tags: string[];
  options: string[];

  resultsVisible: boolean;
  allowMultipleVotes: boolean;

  sharingLink: string;
};

@Component({
  selector: 'app-view-poll',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-poll.html',
  styleUrls: ['./view-poll.css'],
})
export class ViewPoll implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private calendarService = inject(CalendarService);

  apiError = '';
  isLoading = false;

  pollId = '';
  poll: PollViewModel | null = null;

  ngOnInit(): void {
    const pollId = this.route.snapshot.paramMap.get('pollId');
    if (!pollId) {
      this.apiError = 'Missing poll id';
      return;
    }
    this.pollId = pollId;

    this.loadPoll(pollId);
  }

  private loadPoll(pollId: string): void {
    this.apiError = '';
    this.isLoading = true;

    const home$ = this.calendarService.getHomepage().pipe(
      catchError((err) => {
        // Not fatal for poll viewing; we can still show poll without calendar name.
        console.warn('[ViewPoll] Could not load homepage calendars', err);
        return of({ calendars: [], tags: [] } as CalendarHomeDTO);
      })
    );

    const poll$ = this.calendarService.getByPollIds([pollId]).pipe(
      map((res: CalendarFilterResponseDTO) => res.polls?.[0] ?? null),
      catchError((err) => {
        this.apiError =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not load poll';
        return of(null);
      })
    );


    forkJoin({ home: home$, poll: poll$ }).subscribe(({ home, poll }) => {
      this.isLoading = false;

      if (!poll) {
        if (!this.apiError) this.apiError = 'Poll not found';
        return;
      }

      const calendars = (home.calendars ?? []) as CalendarSummaryDTO[];
      const calendarName =
        calendars.find((c) => c.calendar_id === poll.calendar_id)?.name ?? 'Unknown calendar';

      const start = this.isoToLocalDateTime(poll.start_time);
      const end = this.isoToLocalDateTime(poll.end_time);

      this.poll = {
        pollId: poll.poll_id,
        calendarId: poll.calendar_id,
        calendarName,

        title: poll.title ?? '',
        description: poll.description ?? '',
        notes: poll.notes ?? '',

        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,

        tags: poll.tags ?? [],
        options: (poll.options ?? []).map((o) => o.description ?? '').filter((s) => s.trim().length > 0),

        resultsVisible: !!poll.results_visible,
        allowMultipleVotes: !!poll.allow_multiple_votes,

        sharingLink: `${window.location.origin}/view-poll/${poll.poll_id}`,
      };
    });
  }

  // ---- Timezone-safe display helpers (same fix style as your event pages) ----

  private parseServerInstant(iso: string): Date {
    // If server includes timezone (Z or ±hh:mm), Date parses correctly.
    // If it doesn't, assume server meant UTC and append 'Z'.
    const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);
    return new Date(hasTz ? iso : `${iso}Z`);
  }

  private isoToLocalDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };

    const d = this.parseServerInstant(iso);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`; // LOCAL time
    return { date, time };
  }

  // ---- UI actions ----

  goToEdit(): void {
    this.router.navigate(['/edit-poll', this.pollId]);
  }

  goToDelete(): void {
    this.router.navigate(['/delete-poll', this.pollId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/main-page']);
  }

  copyLink(): void {
    const text = this.poll?.sharingLink ?? '';
    if (!text) return;

    navigator.clipboard?.writeText(text).catch(() => {
      // fallback
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
    });
  }
}
