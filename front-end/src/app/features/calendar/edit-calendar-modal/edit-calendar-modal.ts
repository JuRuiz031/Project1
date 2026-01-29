import { Component, OnInit, input, output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { CalendarService } from '../../../shared/services/calendar.service';

import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarSummaryDTO } from '../../../shared/models/calendars/calendar-summary.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';
import { UpdateCalendarDTO } from '../../../shared/models/calendars/update-calendar.dto';

type CalendarUserRow = {
  calendar_id: string;
  user_id: string;
  username: string;
};

@Component({
  selector: 'app-edit-calendar-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BaseModal],
  templateUrl: './edit-calendar-modal.html',
  styleUrls: ['./edit-calendar-modal.css'],
})
export class EditCalendarModal implements OnInit {
  private fb = inject(FormBuilder);
  private calendarService = inject(CalendarService);

  // Inputs/Outputs
  calendarId = input.required<string>();
  // add this alongside calendarId input
  currentUserId = input.required<string>();

  isRequesterAdmin(userId: string): boolean {
    return String(userId) === String(this.currentUserId());
  }

  close = output<void>();

  calendarUpdated = output<string>();         // emits calendarId
  deleteRequested = output<string>();         // switch to delete-calendar modal

  // State
  apiError = signal('');
  isSubmitting = signal(false);
  isLoading = signal(true);

  calendarName = signal<string>('');          // display + form init
  users = signal<CalendarUserRow[]>([]);
  selectedUserId = signal<string | null>(null);

  // Form
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  selectedUser = computed(() => {
    const id = this.selectedUserId();
    if (!id) return null;
    return this.users().find(u => u.user_id === id) ?? null;
  });

  ngOnInit(): void {
    const id = this.calendarId();
    if (!id) {
      this.apiError.set('Missing calendar id');
      this.isLoading.set(false);
      return;
    }

    this.loadCalendarName(id);
    this.loadCalendarUsers(id);
  }

  private loadCalendarName(calendarId: string): void {
    // Use homepage calendar summaries to find the calendar name
    this.calendarService.getHomepage()
      .pipe(take(1))
      .subscribe({
        next: (home: CalendarHomeDTO) => {
          const found = (home.calendars ?? []).find(
            (c: CalendarSummaryDTO) => String(c.calendar_id) === String(calendarId)
          );

          const name = found?.name ?? '';
          this.calendarName.set(name);
          this.form.patchValue({ name }, { emitEvent: false });
        },
        error: () => {
          // Not fatal; user can still edit name if it loads elsewhere
        }
      });
  }

  private loadCalendarUsers(calendarId: string): void {
    this.apiError.set('');
    this.isLoading.set(true);

    // Endpoint: GET /calendar?calendarIds=...
    this.calendarService.getByCalendarIds([calendarId])
      .pipe(take(1))
      .subscribe({
        next: (res: CalendarFilterResponseDTO) => {
          this.isLoading.set(false);

          const rows: CalendarUserRow[] = (res.users ?? [])
            .filter(u => String(u.calendar_id) === String(calendarId))
            .map(u => ({
              calendar_id: String(u.calendar_id),
              user_id: String(u.user_id),
              username: String(u.username ?? ''),
            }))
            .filter(u => u.user_id && u.username);

          this.users.set(rows);

          // keep selection if possible
          const cur = this.selectedUserId();
          if (cur && !rows.some(r => r.user_id === cur)) {
            this.selectedUserId.set(null);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.apiError.set(
            err?.error?.message ||
              (typeof err?.error === 'string' ? err.error : '') ||
              err?.message ||
              'Could not load calendar users'
          );
        },
      });
  }

  selectUser(userId: string): void {
    this.selectedUserId.set(userId);
  }

  saveChanges(): void {
    this.apiError.set('');

    const id = this.calendarId();
    if (!id) {
      this.apiError.set('Missing calendar id');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = String(this.form.getRawValue().name ?? '').trim();
    if (!name) {
      this.apiError.set('Calendar name is required.');
      return;
    }

    const dto: UpdateCalendarDTO = { name };

    this.isSubmitting.set(true);

    this.calendarService.update(id, dto)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.calendarUpdated.emit(id);
          this.close.emit();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.apiError.set(
            err?.error?.message ||
              (typeof err?.error === 'string' ? err.error : '') ||
              err?.message ||
              'Could not save calendar changes'
          );
        },
      });
  }

  promoteSelectedToAdmin(): void {
    this.apiError.set('');

    const id = this.calendarId();
    const selected = this.selectedUserId();

    if (!id) {
      this.apiError.set('Missing calendar id');
      return;
    }
    if (!selected) return;

    const dto: UpdateCalendarDTO = { admins: [selected] };

    this.isSubmitting.set(true);

    this.calendarService.update(id, dto)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          // refresh users (even though endpoint doesn’t show admin status, this keeps data fresh)
          this.loadCalendarUsers(id);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.apiError.set(
            err?.error?.message ||
              (typeof err?.error === 'string' ? err.error : '') ||
              err?.message ||
              'Could not promote user to admin'
          );
        },
      });
  }

  deleteCalendarGroup(): void {
    const id = this.calendarId();
    if (id) this.deleteRequested.emit(id);
  }

  onClose(): void {
    this.close.emit();
  }

  hasError(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.touched && c.invalid;
  }
}
