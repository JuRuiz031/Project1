import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { CalendarService } from '../../../shared/services/calendar.service';
import { CreateCalendarDTO } from '../../../shared/models/calendars/create-calendar.dto';

@Component({
  selector: 'app-create-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-calendar.html',
  styleUrl: './create-calendar.css',
})
export class CreateCalendar {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private calendarService = inject(CalendarService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
  });

  apiError = signal('');
  isSubmitting = signal(false);

  hasError(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.touched && c.invalid;
  }

  private getCurrentUserId(): string | null {
    // Adjust this if you have a single known key; these are safe fallbacks.
    const keysToTry = ['user', 'currentUser', 'auth_user'];

    for (const key of keysToTry) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const obj = JSON.parse(raw);
        const userId = obj?.user_id ?? obj?.id ?? obj?.userId;
        if (typeof userId === 'string' && userId.length > 0) return userId;
      } catch {
        // ignore parse errors and keep trying other keys
      }
    }

    return null;
  }

  createCalendar(): void {
    this.apiError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.apiError.set('Please fix validation errors.');
      return;
    }

    const userId = this.getCurrentUserId();
    if (!userId) {
      this.apiError.set('You must be logged in to create a calendar.');
      return;
    }

    const raw = this.form.getRawValue();
    const dto: CreateCalendarDTO = {
      user_id: userId,
      name: String(raw.name ?? '').trim(),
    };

    if (!dto.name) {
      this.form.markAllAsTouched();
      this.apiError.set('Calendar name is required.');
      return;
    }

    this.isSubmitting.set(true);

    this.calendarService
      .create(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/main-page']);
        },
        error: (err) => {
          const message =
            (err?.error && typeof err.error === 'string' && err.error) ||
            err?.error?.message ||
            err?.message;

          this.apiError.set(message || 'Failed to create calendar. Please try again.');
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/main-page']);
  }
}
