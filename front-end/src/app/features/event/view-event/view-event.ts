import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarSummaryDTO } from '../../../shared/models/calendars/calendar-summary.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { EventDTO } from '../../../shared/models/events/event.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-view-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-event.html',
  styleUrls: ['./view-event.css'],
})
export class ViewEvent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private calendarService = inject(CalendarService);

  calendars: CalendarOption[] = [];
  apiError = '';
  isLoading = false;

  private eventId = '';

  form = this.fb.group({
    calendarId: [{ value: '', disabled: true }],
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

    const id = this.route.snapshot.paramMap.get('eventId');
    if (!id) {
      this.apiError = 'Missing event id';
      return;
    }
    this.eventId = id;

    // Load calendars (for dropdown labels/admin status) + load event
    this.loadCalendars();
    this.loadEvent(id);
  }

  get adminCalendars(): CalendarOption[] {
    return this.calendars.filter(c => c.isAdmin);
  }

  goBack(): void {
    this.router.navigateByUrl('/main-page');
  }

  goToEditEvent(): void {
    this.router.navigateByUrl(`/edit-event/${this.eventId}`);
  }

  private loadCalendars(): void {
    this.calendarService.getHomepage().subscribe({
      next: (home: CalendarHomeDTO) => {
        this.calendars = (home.calendars ?? []).map((c: CalendarSummaryDTO) => ({
          id: c.calendar_id,
          name: c.name,
          isAdmin: c.is_admin,
        }));
      },
      error: (err) => {
        // not fatal for viewing an event; only affects dropdown names/admin filtering
        console.warn('Could not load calendars', err);
      },
    });
  }

  private loadEvent(eventId: string): void {
    this.apiError = '';
    this.isLoading = true;

    this.calendarService.getByEventIds([eventId]).subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        this.isLoading = false;
        const event = res?.events?.[0];
        if (!event) {
          this.apiError = 'Event not found';
          return;
        }
        this.displayEvent(event);
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

  displayEvent(event: EventDTO): void {
    const start = this.isoToDateTime(event.start_time);
    const end = this.isoToDateTime(event.end_time);

    this.form.patchValue(
      {
        calendarId: event.calendar_id ?? '',
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

  private isoToDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };
    const match = iso.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    if (!match) return { date: '', time: '' };
    return { date: match[1], time: match[2] };
  }
}
