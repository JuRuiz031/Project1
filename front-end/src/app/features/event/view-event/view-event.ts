import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { CalendarApiService } from '../../../shared/services/api/calendar-api.service';
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
  private calendarApi = inject(CalendarApiService);

  calendars: CalendarOption[] = [
    { id: '1', name: 'My Admin Calendar', isAdmin: true },
    { id: '2', name: 'Shared Calendar (read-only)', isAdmin: false },
  ];

  apiError = '';

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

    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (!eventId) {
      this.apiError = 'Missing event id';
      return;
    }

    // Use team service: GET /calendar?eventIds=...
    this.calendarApi.getByEventIds([eventId]).subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        const event = res?.events?.[0];
        if (!event) {
          this.apiError = 'Event not found';
          return;
        }
        this.displayEvent(event);
      },
      error: () => (this.apiError = 'Could not load event'),
    });
  }

  get adminCalendars(): CalendarOption[] {
    return this.calendars.filter(c => c.isAdmin);
  }

  goBack(): void {
    this.router.navigateByUrl('/main-page');
  }

  goToEditEvent(): void {
    this.router.navigateByUrl('/edit-event');
  }

  displayEvent(event: EventDTO): void {
    this.apiError = '';

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
