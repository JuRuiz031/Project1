import { Component, OnInit, output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { EventService } from '../../../shared/services/event.service';
import { CalendarService } from '../../../shared/services/calendar.service';

import { CreateEventDTO } from '../../../shared/models/events/create-event.dto';
import { EventDTO } from '../../../shared/models/events/event.dto';

import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarSummaryDTO } from '../../../shared/models/calendars/calendar-summary.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-create-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseModal],
  templateUrl: './create-event-modal.html',
  styleUrls: ['./create-event-modal.css'],
})
export class CreateEventModal implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private calendarService = inject(CalendarService);

  // Outputs
  close = output<void>();
  eventCreated = output<string>(); // emits event ID when created

  // Signals (modern Angular)
  calendars = signal<CalendarOption[]>([]);
  apiError = signal('');
  isSubmitting = signal(false);
  isLoadingCalendars = signal(true);

  // Computed signal for derived state
  adminCalendars = computed(() => this.calendars().filter(c => c.isAdmin));

  form = this.fb.group({
    calendarId: ['', [Validators.required]],
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    startDate: ['', [Validators.required]],
    startTime: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    description: ['', [Validators.maxLength(1000)]],
    notes: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.loadCalendars();
  }

  private loadCalendars(): void {
    this.apiError.set('');

    this.calendarService.getHomepage().subscribe({
      next: (home: CalendarHomeDTO) => {
        this.isLoadingCalendars.set(false);

        const mappedCalendars = home.calendars.map((c: CalendarSummaryDTO) => ({
          id: c.calendar_id,
          name: c.name,
          isAdmin: c.is_admin,
        }));
        this.calendars.set(mappedCalendars);

        // pick default: first admin if possible, else first calendar
        const firstAdmin = this.adminCalendars()[0];
        const firstAny = mappedCalendars[0];
        const selected = firstAdmin ?? firstAny;

        if (selected) {
          this.form.patchValue({ calendarId: selected.id }, { emitEvent: false });
        } else {
          this.apiError.set('No calendars available. Create or join a calendar first.');
        }
      },
      error: (err) => {
        this.isLoadingCalendars.set(false);
        this.apiError.set(
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not load calendars'
        );
      },
    });
  }

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

  // Deterministic "end after start" check (no timezone surprises)
  private isEndAfterStart(startDate: string, startTime: string, endDate: string, endTime: string): boolean {
    const startKey = `${startDate}T${startTime}`;
    const endKey = `${endDate}T${endTime}`;
    return endKey > startKey; // strict
  }

  submit(): void {
    this.apiError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const start = new Date(`${v.startDate}T${v.startTime}:00`);
    const end = new Date(`${v.endDate}T${v.endTime}:00`);

    if (isNaN(start.getTime())) {
      this.apiError.set('Start date/time is invalid.');
      return;
    }
    if (isNaN(end.getTime())) {
      this.apiError.set('End date/time is invalid.');
      return;
    }

    if (!this.isEndAfterStart(String(v.startDate), String(v.startTime), String(v.endDate), String(v.endTime))) {
      this.apiError.set('End must be after start.');
      return;
    }

    const userId = this.getUserIdFromStorage();
    if (!userId) {
      this.apiError.set('Not logged in (missing user id). Please sign in again.');
      return;
    }

    const dto: CreateEventDTO = {
      user_id: String(userId),
      calendar_id: String(v.calendarId),
      title: String(v.title),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      description: v.description ?? '',
      notes: v.notes ?? '',
      tags: [],
    };

    this.isSubmitting.set(true);

    this.eventService.create(dto).subscribe({
      next: (created: EventDTO) => {
        this.isSubmitting.set(false);
        this.eventCreated.emit(created.event_id);
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.apiError.set(
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not create event'
        );
      },
    });
  }

  hasError(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.touched && c.invalid;
  }

  onClose(): void {
    this.close.emit();
  }
}
