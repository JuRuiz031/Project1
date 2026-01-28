import { Component, OnInit, input, output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BaseModal],
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
  eventUpdated = output<string>();       // emits event ID when updated
  deleteRequested = output<string>();    // emits event ID to switch to delete modal

  private eventIdValue = '';

  // Signals
  calendars = signal<CalendarOption[]>([]);
  apiError = signal('');
  isSubmitting = signal(false);
  isLoading = signal(true);
  tags = signal<string[]>([]);
  tagInput = signal('');

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
    const id = this.eventId();
    if (!id) {
      this.apiError.set('Missing event id');
      this.isLoading.set(false);
      return;
    }
    this.eventIdValue = id;

    this.loadCalendars();
    this.loadEvent(id);
  }

  private loadCalendars(): void {
    this.calendarService.getHomepage()
      .pipe(take(1))
      .subscribe({
        next: (home: CalendarHomeDTO) => {
          const mappedCalendars: CalendarOption[] = (home.calendars ?? []).map((c: CalendarSummaryDTO) => ({
            id: c.calendar_id,
            name: c.name,
            isAdmin: c.is_admin,
          }));
          this.calendars.set(mappedCalendars);
        },
        error: (err) => {
          // not fatal
          console.warn('Could not load calendars', err);
        },
      });
  }

  private loadEvent(id: string): void {
    this.apiError.set('');
    this.isLoading.set(true);

    this.calendarService.getByEventIds([id])
      .pipe(take(1))
      .subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        this.isLoading.set(false);
        const ev = res.events?.[0];
        if (!ev) {
          this.apiError.set('Event not found');
          return;
        }

        const start = this.isoToDateTime(ev.start_time);
        const end = this.isoToDateTime(ev.end_time);

        this.form.patchValue(
          {
            calendarId: ev.calendar_id ?? '',
            title: ev.title ?? '',
            startDate: start.date,
            startTime: start.time,
            endDate: end.date,
            endTime: end.time,
            description: ev.description ?? '',
            notes: ev.notes ?? '',
          },
          { emitEvent: false }
        );

        // Load existing tags
        this.tags.set(ev.tags ?? []);
      },
      error: (err) => {
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

  /**
   * If backend sends timestamps without timezone (e.g. "2026-01-26T17:30:00"),
   * JS will treat that as LOCAL time and you get a +6 hour drift.
   * Fix: if no timezone assume UTC and append 'Z'.
   */
  private parseServerInstant(iso: string): Date {
    const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);
    return new Date(hasTz ? iso : `${iso}Z`);
  }

  // ✅ ISO -> Local date/time for <input type="date"> and <input type="time">
  private isoToDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };

    const d = this.parseServerInstant(iso);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`; // LOCAL time
    return { date, time };
  }

  // ✅ Build a Date in LOCAL time (avoids "YYYY-MM-DDTHH:mm" parsing ambiguity)
  private toLocalDate(date: string, time: string): Date | null {
    if (!date || !time) return null;

    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);

    if (![y, m, d, hh, mm].every(Number.isFinite)) return null;

    const local = new Date(y, m - 1, d, hh, mm, 0, 0);
    return isNaN(local.getTime()) ? null : local;
  }

  saveChanges(): void {
    this.apiError.set('');

    // NOTE: in modal code the input is a function; the id string lives in eventIdValue
    if (!this.eventIdValue) {
      this.apiError.set('Missing event id');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const start = this.toLocalDate(String(v.startDate ?? ''), String(v.startTime ?? ''));
    const end = this.toLocalDate(String(v.endDate ?? ''), String(v.endTime ?? ''));

    if (!start) {
      this.apiError.set('Start date/time is invalid.');
      return;
    }
    if (!end) {
      this.apiError.set('End date/time is invalid.');
      return;
    }
    if (end.getTime() <= start.getTime()) {
      this.apiError.set('End must be after start.');
      return;
    }

    const dto: UpdateEventDTO = {
      calendar_id: String(v.calendarId ?? ''),
      title: String(v.title ?? ''),
      start_time: start.toISOString(), // store UTC instant
      end_time: end.toISOString(),
      description: (v.description ?? '') as string,
      notes: (v.notes ?? '') as string,
      tags: this.tags(),
    };

    this.isSubmitting.set(true);

    this.eventService.update(this.eventIdValue, dto)
      .pipe(take(1))
      .subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.eventUpdated.emit(this.eventIdValue);
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.apiError.set(
          err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            'Could not save changes'
        );
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

  addTag(): void {
    const tag = this.tagInput().trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update(current => [...current, tag]);
      this.tagInput.set('');
    }
  }

  removeTag(tag: string): void {
    this.tags.update(current => current.filter(t => t !== tag));
  }

  onTagKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  /**
   * Get user's timezone abbreviation (e.g., EST, PST, UTC)
   */
  getTimezoneAbbr(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart?.value ?? 'UTC';
  }
}
