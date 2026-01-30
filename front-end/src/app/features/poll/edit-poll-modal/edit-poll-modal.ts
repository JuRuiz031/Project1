import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';
import { CalendarService } from '../../../shared/services/calendar.service';
import { PollService } from '../../../shared/services/poll.service';

import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarSummaryDTO } from '../../../shared/models/calendars/calendar-summary.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';

import { PollDTO } from '../../../shared/models/polls/poll.dto';
import { UpdatePollDTO } from '../../../shared/models/polls/update-poll.dto';
import { PollOptionDTO } from '../../../shared/models/polls/poll-option.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };
type OptionMeta = { option_id?: number; description: string };

@Component({
  selector: 'app-edit-poll-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BaseModal],
  templateUrl: './edit-poll-modal.html',
  styleUrls: ['./edit-poll-modal.css'],
})
export class EditPollModal implements OnInit {
  private fb = inject(FormBuilder);
  private calendarService = inject(CalendarService);
  private pollService = inject(PollService);

  title = input<string>('Edit Poll');
  pollId = input<string>(''); // ✅ passed from parent

  close = output<void>();
  saved = output<string>();   // emits poll_id after save
  deleted = output<string>(); // emits poll_id if you wire deletion later

  calendars = signal<CalendarOption[]>([]);
  adminCalendars = computed(() => this.calendars().filter(c => c.isAdmin));

  apiError = signal('');
  isSubmitting = signal(false);
  isLoading = signal(false);
  isLoadingCalendars = signal(false);

  tagInput = '';
  optionInput = '';

  selectedOptionIndex = signal<number | null>(null);

  // ✅ keeps option_id aligned with each FormArray index
  private optionsMeta = signal<OptionMeta[]>([]);

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
    options: this.fb.array<FormControl<string | null>>([]),
  });

  ngOnInit(): void {
    const id = (this.pollId() || '').trim();
    if (!id) {
      this.apiError.set('Missing poll id');
      return;
    }

    this.loadCalendars();
    this.loadPoll(id);
  }

  // ---- getters ----
  get tags(): FormArray<FormControl<string | null>> {
    return this.form.get('tags') as FormArray<FormControl<string | null>>;
  }
  get options(): FormArray<FormControl<string | null>> {
    return this.form.get('options') as FormArray<FormControl<string | null>>;
  }

  // ----------------------------
  // Calendars
  // ----------------------------
  private loadCalendars(): void {
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

        // default if none selected
        const current = this.form.get('calendarId')?.value;
        if (!current) {
          const firstAdmin = mapped.find(c => c.isAdmin);
          const firstAny = mapped[0];
          const selected = firstAdmin ?? firstAny;
          if (selected) {
            this.form.patchValue({ calendarId: selected.id }, { emitEvent: false });
          }
        }
      },
      error: (err) => {
        this.isLoadingCalendars.set(false);
        console.warn('Could not load calendars', err);
      },
    });
  }

  // ----------------------------
  // Load Poll
  // ----------------------------
  private loadPoll(pollId: string): void {
    this.apiError.set('');
    this.isLoading.set(true);

    this.calendarService.getByPollIds([pollId]).subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        this.isLoading.set(false);
        const poll = res.polls?.[0];
        if (!poll) {
          this.apiError.set('Poll not found');
          return;
        }
        this.patchFormFromPoll(poll);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.apiError.set(
          err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            'Could not load poll'
        );
      },
    });
  }

  private patchFormFromPoll(poll: PollDTO): void {
    const start = this.isoToDateTime(poll.start_time);
    const end = this.isoToDateTime(poll.end_time);

    this.form.patchValue(
      {
        calendarId: poll.calendar_id ?? '',
        title: poll.title ?? '',
        description: poll.description ?? '',
        notes: poll.notes ?? '',
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        results_visible: !!poll.results_visible,
        allow_multiple_votes: !!poll.allow_multiple_votes,
      },
      { emitEvent: false }
    );

    this.tags.clear();
    (poll.tags ?? []).forEach(t =>
      this.tags.push(this.fb.control(t, [Validators.required, Validators.maxLength(30)]))
    );

    // ✅ build both FormArray and meta (to preserve option_id)
    this.options.clear();
    const meta: OptionMeta[] = (poll.options ?? []).map((opt: PollOptionDTO) => ({
      option_id: opt.option_id,
      description: opt.description ?? '',
    }));

    meta.forEach(m =>
      this.options.push(
        this.fb.control(m.description, [Validators.required, Validators.minLength(1), Validators.maxLength(80)])
      )
    );

    // Ensure minimum 2
    while (this.options.length < 2) {
      meta.push({ option_id: undefined, description: '' });
      this.options.push(
        this.fb.control('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)])
      );
    }

    this.optionsMeta.set(meta);
  }

  // ----------------------------
  // Time helpers
  // ----------------------------
  private parseServerInstant(iso: string): Date {
    const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);
    return new Date(hasTz ? iso : `${iso}Z`);
  }

  private isoToDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };
    const d = this.parseServerInstant(iso);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  }

  private toLocalDate(date: string, time: string): Date | null {
    if (!date || !time) return null;
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    if (![y, m, d, hh, mm].every(Number.isFinite)) return null;
    const local = new Date(y, m - 1, d, hh, mm, 0, 0);
    return isNaN(local.getTime()) ? null : local;
  }

  // ----------------------------
  // Selection
  // ----------------------------
  selectOption(i: number): void {
    this.selectedOptionIndex.set(i);
  }

  // ----------------------------
  // Tags
  // ----------------------------
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

  removeTag(i: number): void {
    this.tags.removeAt(i);
  }

  // ----------------------------
  // Options (keep meta in sync!)
  // ----------------------------
  addOption(): void {
    this.apiError.set('');
    const value = (this.optionInput || '').trim();
    if (!value) return;

    if (this.options.length >= 20) {
      this.apiError.set('Max 20 options allowed.');
      return;
    }

    this.options.push(this.fb.control(value, [Validators.required, Validators.minLength(1), Validators.maxLength(80)]));

    const meta = [...this.optionsMeta()];
    meta.push({ option_id: undefined, description: value });
    this.optionsMeta.set(meta);

    this.optionInput = '';
    this.selectedOptionIndex.set(null);
  }

  deleteSelectedOption(): void {
    const idx = this.selectedOptionIndex();
    if (idx === null) return;

    if (this.options.length <= 2) {
      this.apiError.set('A poll must have at least 2 options.');
      return;
    }

    this.options.removeAt(idx);

    const meta = [...this.optionsMeta()];
    meta.splice(idx, 1);
    this.optionsMeta.set(meta);

    this.selectedOptionIndex.set(null);
  }

  // ----------------------------
  // Save
  // ----------------------------
  confirmEdit(): void {
    this.apiError.set('');

    const pollId = (this.pollId() || '').trim();
    if (!pollId) {
      this.apiError.set('Missing poll id');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.apiError.set('Please fix validation errors.');
      return;
    }

    if (this.options.length < 2) {
      this.apiError.set('A poll must have at least 2 options.');
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

    const descriptions = (v.options ?? [])
      .map((o: string | null) => (o ?? '').trim())
      .filter((o: string) => o.length > 0);

    if (descriptions.length < 2) {
      this.apiError.set('A poll must have at least 2 options.');
      return;
    }

    // ✅ build options with option_id when possible
    const meta = this.optionsMeta();
    const options: UpdatePollDTO['options'] = descriptions.map((desc, i) => ({
      option_id: meta[i]?.option_id,
      description: desc,
    }));

    const userId = this.getUserIdFromStorage();
    if (!userId) {
      this.apiError.set('Not logged in (missing user id). Please sign in again.');
      return;
    }

    const dto: UpdatePollDTO = {
      user_id: String(userId),
      calendar_id: String(v.calendarId),
      title: String(v.title),
      description: (String(v.description ?? '')).trim() || undefined,
      notes: (String(v.notes ?? '')).trim() || undefined,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      results_visible: Boolean(v.results_visible),
      allow_multiple_votes: Boolean(v.allow_multiple_votes),
      options,
      tags,
    };

    this.isSubmitting.set(true);

    this.pollService.update(pollId, dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit(pollId);
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.apiError.set(
          err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            'Could not update poll'
        );
      },
    });
  }

  onDelete(): void {
    // You can wire your delete modal here later.
    // For now, just emit so parent can open DeletePollModal or route.
    const id = (this.pollId() || '').trim();
    if (id) this.deleted.emit(id);
  }

  onClose(): void {
    this.close.emit();
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
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



}
