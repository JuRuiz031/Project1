import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { finalize } from 'rxjs';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { CalendarService } from '../../../shared/services/calendar.service';

import { CreateCalendarDTO } from '../../../shared/models/calendars/create-calendar.dto';
import { CreateCalendarResponseDTO } from '../../../shared/models/calendars/create-calendar-response.dto';

@Component({
  selector: 'app-create-calendar-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseModal],
  templateUrl: './create-calendar-modal.html',
  styleUrls: ['./create-calendar-modal.css'],
})
export class CreateCalendarModal {
  private fb = inject(FormBuilder);
  private calendarService = inject(CalendarService);

  // Outputs (modal-style)
  close = output<void>();
  calendarCreated = output<string>(); // emits calendar_id

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
    // same safe fallbacks as current create-calendar
    const keysToTry = ['user', 'currentUser', 'auth_user'];

    for (const key of keysToTry) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const obj = JSON.parse(raw);
        const userId = obj?.user_id ?? obj?.id ?? obj?.userId;
        if (typeof userId === 'string' && userId.length > 0) return userId;
      } catch {
        // ignore and keep trying
      }
    }

    return null;
  }

  submit(): void {
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
        next: (created: CreateCalendarResponseDTO) => {
          this.calendarCreated.emit(created.calendar_id);
          this.close.emit();
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

  onClose(): void {
    this.close.emit();
  }
}
