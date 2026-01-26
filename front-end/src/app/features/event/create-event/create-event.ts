import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
    console.log('CreateEvent payload:', payload);

    setTimeout(() => {
      this.isSubmitting = false;
      this.form.reset();
    }, 400);
  }

  hasError(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.touched && c.invalid;
  }

  cancel(): void {
    this.router.navigateByUrl('/main-page');
  }
}
