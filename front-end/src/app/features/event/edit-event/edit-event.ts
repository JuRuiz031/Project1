import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


type CalendarOption = { id: string; name: string; isAdmin: boolean };

type EventDTO = {
  calendarId: string;
  title: string;
  startDate: string; // yyyy-mm-dd
  startTime: string; // hh:mm
  endDate: string;   // yyyy-mm-dd
  endTime: string;   // hh:mm
  description: string;
  notes: string;
};

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-event.html',
  styleUrls: ['./edit-event.css'],
})
export class EditEvent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

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
    // Placeholder: this will eventually fetch the event by id (route param)
    // and populate the form with real data.
    this.populateFromExistingEvent();
  }

  get adminCalendars(): CalendarOption[] {
    // For now: only allow editing within admin calendars (matches your CreateEvent logic).
    return this.calendars.filter(c => c.isAdmin);
  }

  /**
   * Placeholder: replace this with a service call (e.g., EventService.getEventById(id)).
   * For now, it loads fake data so you can see the edit page working end-to-end.
   */
  private populateFromExistingEvent(): void {
    const existing: EventDTO = {
      calendarId: this.adminCalendars[0]?.id ?? '',
      title: 'Placeholder Event Title',
      startDate: '2026-01-23',
      startTime: '09:00',
      endDate: '2026-01-23',
      endTime: '10:00',
      description: 'This is placeholder data. Replace populateFromExistingEvent() with a real API call.',
      notes: 'Notes placeholder.',
    };

    this.form.patchValue(existing);
  }

  saveChanges(): void {
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
    if (end <= start) {
      this.apiError = 'End must be after start.';
      return;
    }

    const payload = {
      calendar_id: v.calendarId,
      title: v.title,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      description: v.description ?? '',
      notes: v.notes ?? '',
    };

    this.isSubmitting = true;
    console.log('EditEvent payload:', payload);

    // Placeholder "save" behavior: pretend API call succeeded
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigateByUrl('/main-page');
    }, 400);
  }

  hasError(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.touched && c.invalid;
  }
}
