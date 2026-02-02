import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InviteService } from '../../../shared/services/invite.service';
import { MainFooter } from '../../shared/main-footer/main-footer';
import { EventDTO } from '../../../shared/models/events/event.dto';
import { isEventInvite, isPollInvite } from '../../../shared/models/invites/invite-details-response.dto';

/**
 * Guest-only event viewing component
 * Used when guests click on invite links to view event details
 * If the invite is for a poll, redirects to the poll view page
 * Authenticated users see events in modals instead
 */
@Component({
  selector: 'app-view-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainFooter, RouterLink],
  templateUrl: './view-event.html',
  styleUrls: ['./view-event.css'],
})
export class ViewEvent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inviteService = inject(InviteService);

  apiError = signal('');
  isLoading = signal(false);
  tags = signal<string[]>([]);

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
    console.log('[ViewEvent] Token from URL:', token);

    if (token) {
      this.loadEventByToken(token);
    } else {
      this.apiError.set('Missing invite token. Please use the invite link provided.');
    }
  }

  private loadEventByToken(token: string): void {
    this.apiError.set('');
    this.isLoading.set(true);
    console.log('[ViewEvent] Loading event with token:', token);

    // Call the public invite endpoint: GET /api/v1/invitelink?token=xyz
    this.inviteService.getInviteDetails(token).subscribe({
      next: (details) => {
        console.log('[ViewEvent] Received details:', details);
        console.log('[ViewEvent] Before setting isLoading to false, isLoading =', this.isLoading());
        this.isLoading.set(false);
        console.log('[ViewEvent] After setting isLoading to false, isLoading =', this.isLoading());
        if (!details) {
          this.apiError.set('Event not found');
          return;
        }
        // Type guard: check if this is an event or poll invite
        if (isEventInvite(details)) {
          console.log('[ViewEvent] Is event invite, displaying...');
          this.displayEvent(details);
        } else if (isPollInvite(details)) {
          console.log('[ViewEvent] Is poll invite, redirecting to poll view...');
          // Redirect to poll view, passing the already-fetched data
          this.router.navigate(['/polllink'], { 
            queryParams: { token },
            state: { pollData: details }
          });
        } else {
          console.log('[ViewEvent] Unknown invite type');
          this.apiError.set('Invalid invite link');
        }
      },
      error: (err) => {
        console.error('[ViewEvent] Error loading event:', err);
        this.isLoading.set(false);
        this.apiError.set(
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not load event'
        );
      },
    });
  }

  private displayEvent(event: EventDTO): void {
    console.log('[ViewEvent] displayEvent called with:', event);
    const start = this.isoToDateTime(event.start_time);
    const end = this.isoToDateTime(event.end_time);
    console.log('[ViewEvent] Parsed times - start:', start, 'end:', end);

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

    // Set tags
    this.tags.set(event.tags ?? []);

    this.form.disable({ emitEvent: false });
    console.log('[ViewEvent] Form patched and disabled. Form value:', this.form.value);
  }

  private isoToDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };

    // Backend sends local datetime without timezone info
    // Parse directly without timezone conversion
    const d = new Date(iso);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return { date, time };
  }
}
