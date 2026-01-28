import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { InviteService } from '../../../shared/services/invite.service';
import { EventDTO } from '../../../shared/models/events/event.dto';
import { isEventInvite } from '../../../shared/models/invites/invite-details-response.dto';

/**
 * Guest-only event viewing component
 * Used when guests click on invite links to view event details
 * Authenticated users see events in modals instead
 */
@Component({
  selector: 'app-view-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-event.html',
  styleUrls: ['./view-event.css'],
})
export class ViewEvent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private inviteService = inject(InviteService);

  apiError = '';
  isLoading = false;

  form = this.fb.group({
    title: [{ value: '', disabled: true }],
    startDate: [{ value: '', disabled: true }],
    startTime: [{ value: '', disabled: true }],
    endDate: [{ value: '', disabled: true }],
    endTime: [{ value: '', disabled: true }],
    description: [{ value: '', disabled: true }],
    notes: [{ value: '', disabled: true }],
  });

  ngOnInit(): void {
    this.form.disable({ emitEvent: false });

    // Guest-only: expects invite token in query param
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.loadEventByToken(token);
    } else {
      this.apiError = 'Missing invite token. Please use the invite link provided.';
    }
  }

  private loadEventByToken(token: string): void {
    this.apiError = '';
    this.isLoading = true;

    // Call the public invite endpoint: GET /api/v1/invitelink?token=xyz
    this.inviteService.getInviteDetails(token).subscribe({
      next: (details) => {
        this.isLoading = false;
        if (!details) {
          this.apiError = 'Event not found';
          return;
        }
        // Type guard: ensure this is an event invite, not a poll invite
        if (isEventInvite(details)) {
          this.displayEvent(details);
        } else {
          this.apiError = 'Invalid event invite link';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.apiError =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not load event';
      },
    });
  }

  private displayEvent(event: EventDTO): void {
    const start = this.isoToDateTime(event.start_time);
    const end = this.isoToDateTime(event.end_time);

    this.form.patchValue(
      {
        title: event.title ?? '',
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        description: event.description ?? '',
        notes: event.notes ?? '',
      },
      { emitEvent: false }
    );

    this.form.disable({ emitEvent: false });
  }

   private parseServerInstant(iso: string): Date {
      // If the server already sent a timezone (Z or ±hh:mm), Date can parse safely.
      // If not, we assume the server meant UTC and append 'Z'.
      const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);
      return new Date(hasTz ? iso : `${iso}Z`);
    }

  private isoToDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };

    const d = this.parseServerInstant(iso);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`; // LOCAL time
    return { date, time };
  }
}
