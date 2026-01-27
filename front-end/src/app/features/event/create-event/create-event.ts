import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { EventService } from '../../../shared/services/event.service';
import { CreateEventDTO } from '../../../shared/models/events/create-event.dto';
import { EventDTO } from '../../../shared/models/events/event.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.css'],
})
export class CreateEvent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private eventService = inject(EventService);

  calendars: CalendarOption[] = [
    { id: '1', name: 'My Admin Calendar', isAdmin: true },
    { id: '2', name: 'Shared Calendar (read-only)', isAdmin: false },
  ];

  apiError = '';
  isSubmitting = false;

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
    const firstAdmin = this.calendars.find(c => c.isAdmin);
    if (firstAdmin) this.form.patchValue({ calendarId: firstAdmin.id });
  }

  get adminCalendars(): CalendarOption[] {
    return this.calendars.filter(c => c.isAdmin);
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
    this.apiError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

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

    if (!this.isEndAfterStart(String(v.startDate), String(v.startTime), String(v.endDate), String(v.endTime))) {
      this.apiError = 'End must be after start.';
      return;
    }

    const userId = this.getUserIdFromStorage();
    if (!userId) {
      this.apiError = 'Not logged in (missing user id). Please sign in again.';
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

    this.isSubmitting = true;

    this.eventService.create(dto).subscribe({
      next: (created: EventDTO) => {
        this.isSubmitting = false;
        this.router.navigateByUrl(`/view-event/${created.event_id}`);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.apiError =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not create event';
      },
    });
  }

  hasError(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.touched && c.invalid;
  }

  cancel(): void {
    this.router.navigateByUrl('/main-page');
  }
}
