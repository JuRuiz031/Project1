import { Component, OnInit, input, output, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { EventService } from '../../../shared/services/event.service';
import { UpdateEventDTO } from '../../../shared/models/events/update-event.dto';

import { CalendarService } from '../../../shared/services/calendar.service';
import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarSummaryDTO } from '../../../shared/models/calendars/calendar-summary.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-edit-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseModal],
  templateUrl: './edit-event-modal.html',
  styleUrls: ['./edit-event-modal.css'],
})
export class EditEventModal implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private calendarService = inject(CalendarService);

  // Inputs/Outputs
  eventId = input.required<string>();
  close = output<void>();
  eventUpdated = output<string>(); // emits event ID when updated
  deleteRequested = output<string>(); // emits event ID to switch to delete modal

  private eventIdValue = '';

  calendars: CalendarOption[] = [];

  apiError = '';
  isSubmitting = false;
  isLoading = false;

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
    const id = this.eventId();
    if (!id) {
      this.apiError = 'Missing event id';
      return;
    }
    this.eventIdValue = id;

    this.loadCalendars();
    this.loadEvent(id);
  }

  get adminCalendars(): CalendarOption[] {
    return this.calendars.filter(c => c.isAdmin);
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
        // not fatal to edit (but affects dropdown options)
        console.warn('Could not load calendars', err);
      },
    });
  }

  private loadEvent(id: string): void {
    this.apiError = '';
    this.isLoading = true;

    this.calendarService.getByEventIds([id]).subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        this.isLoading = false;
        const ev = res.events?.[0];
        if (!ev) {
          this.apiError = 'Event not found';
          return;
        }

        const start = this.isoToDateTime(ev.start_time);
        const end = this.isoToDateTime(ev.end_time);

        this.form.patchValue({
          calendarId: ev.calendar_id ?? '',
          title: ev.title ?? '',
          startDate: start.date,
          startTime: start.time,
          endDate: end.date,
          endTime: end.time,
          description: ev.description ?? '',
          notes: ev.notes ?? '',
        });
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

  private isoToDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };
    const match = iso.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    if (!match) return { date: '', time: '' };
    return { date: match[1], time: match[2] };
  }

  private isEndAfterStart(startDate: string, startTime: string, endDate: string, endTime: string): boolean {
    return `${endDate}T${endTime}` > `${startDate}T${startTime}`; // strict
  }

  saveChanges(): void {
    this.apiError = '';

    if (!this.eventId) {
      this.apiError = 'Missing event id';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    if (!this.isEndAfterStart(String(v.startDate), String(v.startTime), String(v.endDate), String(v.endTime))) {
      this.apiError = 'End must be after start.';
      return;
    }

    const start = new Date(`${v.startDate}T${v.startTime}:00`);
    const end = new Date(`${v.endDate}T${v.endTime}:00`);

    if (isNaN(start.getTime())) {
      this.apiError = 'Start date/time is invalid.';
      return;
    }
    if (isNaN(end.getTime())) {
      this.apiError = 'End date/time is invalid.';
      return;
    }

    const dto: UpdateEventDTO = {
      calendar_id: String(v.calendarId),
      title: String(v.title),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      description: v.description ?? '',
      notes: v.notes ?? '',
      tags: [],
    };

    this.isSubmitting = true;

    this.eventService.update(this.eventIdValue, dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.eventUpdated.emit(this.eventIdValue);
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.apiError =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not save changes';
      },
    });
  }

  deleteEvent(): void {
    this.deleteRequested.emit(this.eventIdValue);
  }

  onClose(): void {
    this.close.emit();
  }

  hasError(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.touched && c.invalid;
  }
}
