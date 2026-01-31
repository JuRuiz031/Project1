import { Component, OnInit, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { PollService } from '../../../shared/services/poll.service';

import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarSummaryDTO } from '../../../shared/models/calendars/calendar-summary.dto';

import { CreatePollDTO } from '../../../shared/models/polls/create-poll.dto';
import { PollDTO } from '../../../shared/models/polls/poll.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-create-poll-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BaseModal],
  templateUrl: './create-poll-modal.html',
  styleUrls: ['./create-poll-modal.css'],
})
export class CreatePollModal implements OnInit {
  private fb = inject(FormBuilder);
  private calendarService = inject(CalendarService);
  private pollService = inject(PollService);

  // Optional inputs if you want to control behavior from parent later
  title = input<string>('Create Poll');

  // Outputs
  close = output<void>();
  pollCreated = output<string>(); // emits poll_id after successful create

  // State (signals, consistent with other modals)
  calendars = signal<CalendarOption[]>([]);
  apiError = signal('');
  isSubmitting = signal(false);
  isLoadingCalendars = signal(false);

  adminCalendars = computed(() => this.calendars().filter(c => c.isAdmin));

  // UI-only inputs for add rows
  tagInput = '';
  optionInput = '';

  form = this.fb.group({
    calendarId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(1000)]],
    notes: ['', [Validators.maxLength(1000)]],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],

    results_visible: [true, Validators.required],
    allow_multiple_votes: [false, Validators.required],

    tags: this.fb.array<FormControl<string | null>>([]),

    // UI-only option strings -> mapped to {description}[]
    options: this.fb.array<FormControl<string | null>>([
      this.fb.control('Option 1', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      this.fb.control('Option 2', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
    ]),
  });

  ngOnInit(): void {
    this.loadCalendars();
  }

  // ---- FormArray getters ----
  get tags(): FormArray<FormControl<string | null>> {
    return this.form.get('tags') as FormArray<FormControl<string | null>>;
  }

  get options(): FormArray<FormControl<string | null>> {
    return this.form.get('options') as FormArray<FormControl<string | null>>;
  }

  // ---- Calendars ----
  private loadCalendars(): void {
    this.apiError.set('');
    this.isLoadingCalendars.set(true);

    this.calendarService.getHomepage().subscribe({
      next: (home: CalendarHomeDTO) => {
        this.isLoadingCalendars.set(false);

        const mapped = (home.calendars ?? []).map((c: CalendarSummaryDTO) => ({
          id: c.calendar_id,
          name: c.name,
          isAdmin: c.is_admin,
        }));

        this.calendars.set(mapped);

        // default: first admin else first
        const firstAdmin = mapped.find(c => c.isAdmin);
        const firstAny = mapped[0];
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

  // ---- Auth helper ----
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

  // ---- Build local Date from date/time inputs (no timezone conversion) ----
  private toLocalDate(date: string, time: string): Date | null {
    if (!date || !time) return null;

    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);

    if (![y, m, d, hh, mm].every(Number.isFinite)) return null;

    const local = new Date(y, m - 1, d, hh, mm, 0, 0);
    return isNaN(local.getTime()) ? null : local;
  }

  // ---- TAGS ----
  addTag(): void {
    this.apiError.set('');
    const value = (this.tagInput || '').trim();
    if (!value) return;

    const exists = this.tags.controls.some(c => (c.value || '').toLowerCase() === value.toLowerCase());
    if (exists) {
      this.apiError.set('Tag already exists.');
      return;
    }

    if (value.length > 30) {
      this.apiError.set('Tag is too long (max 30 chars).');
      return;
    }

    this.tags.push(this.fb.control(value, [Validators.required, Validators.maxLength(30)]));
    this.tagInput = '';
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  // ---- OPTIONS ----
  addOption(): void {
    this.apiError.set('');
    const value = (this.optionInput || '').trim();
    if (!value) return;

    if (this.options.length >= 20) {
      this.apiError.set('Max 20 options allowed.');
      return;
    }

    this.options.push(this.fb.control(value, [Validators.required, Validators.minLength(1), Validators.maxLength(80)]));
    this.optionInput = '';
  }

  removeOption(index: number): void {
    if (this.options.length <= 2) {
      this.apiError.set('A poll must have at least 2 options.');
      return;
    }
    this.options.removeAt(index);
  }

  // ---- SUBMIT ----
  submit(): void {
    this.apiError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.apiError.set('Please fix validation errors.');
      return;
    }

    if (this.options.length < 2) {
      this.apiError.set('A poll must have at least 2 options.');
      return;
    }

    const userId = this.getUserIdFromStorage();
    if (!userId) {
      this.apiError.set('Not logged in (missing user id). Please sign in again.');
      return;
    }

    const v = this.form.getRawValue();

    const start = this.toLocalDate(String(v.startDate), String(v.startTime));
    const end = this.toLocalDate(String(v.endDate), String(v.endTime));

    if (!start || !end) {
      this.apiError.set('Start/End date-time is invalid.');
      return;
    }
    if (end.getTime() <= start.getTime()) {
      this.apiError.set('End must be after start.');
      return;
    }

    const tags = (v.tags ?? [])
      .map((t: string | null) => (t ?? '').trim())
      .filter((t: string) => t.length > 0);

    const options = (v.options ?? [])
      .map((o: string | null) => (o ?? '').trim())
      .filter((o: string) => o.length > 0)
      .map((o: string) => ({ description: o }));

    if (options.length < 2) {
      this.apiError.set('A poll must have at least 2 options.');
      return;
    }

    // Format as local datetime string (YYYY-MM-DDTHH:mm:ss) without timezone conversion
    const formatLocalDateTime = (d: Date): string => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const dto: CreatePollDTO = {
      user_id: String(userId),
      calendar_id: String(v.calendarId),

      title: String(v.title),
      description: (String(v.description ?? '')).trim() || undefined,
      notes: (String(v.notes ?? '')).trim() || undefined,

      start_time: formatLocalDateTime(start),
      end_time: formatLocalDateTime(end),

      results_visible: Boolean(v.results_visible),
      allow_multiple_votes: Boolean(v.allow_multiple_votes),

      options,
      tags,
    };

    this.isSubmitting.set(true);

    this.pollService.create(dto).subscribe({
      next: (created: PollDTO) => {
        this.isSubmitting.set(false);
        this.pollCreated.emit(created.poll_id);
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.apiError.set(
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not create poll'
        );
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }

  // If you want a Back button later, wire output like other modals.
  onBack(): void {
    // no-op for now (or emit a back output if you add one)
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }
}
