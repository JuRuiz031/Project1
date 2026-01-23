import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-view-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './view-event.html',
  styleUrls: ['./view-event.css'],
})
export class ViewEvent implements OnInit {
  private fb = inject(FormBuilder);

  // Kept for UI consistency (dropdown still renders), but form stays disabled.
  calendars: CalendarOption[] = [
    { id: '1', name: 'My Admin Calendar', isAdmin: true },
    { id: '2', name: 'Shared Calendar (read-only)', isAdmin: false },
  ];

  // Optional: keep this pattern consistent with CreateEvent
  apiError = '';

  // All fields intentionally empty for now.
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
    // Keep the same “default calendar selection” behavior visually,
    // but the control remains disabled and empty until you wire real data.
    const firstAdmin = this.calendars.find(c => c.isAdmin);
    if (firstAdmin) this.form.patchValue({ calendarId: firstAdmin.id });

    // Ensure the entire form is uneditable for View mode.
    this.form.disable({ emitEvent: false });
  }

  get adminCalendars(): CalendarOption[] {
    return this.calendars.filter(c => c.isAdmin);
  }
}
