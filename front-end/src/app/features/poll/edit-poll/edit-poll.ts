import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { CalendarService } from '../../../shared/services/calendar.service';
import { PollService } from '../../../shared/services/poll.service';

import { CalendarHomeDTO } from '../../../shared/models/calendars/calendar-home.dto';
import { CalendarSummaryDTO } from '../../../shared/models/calendars/calendar-summary.dto';
import { CalendarFilterResponseDTO } from '../../../shared/models/calendars/calendar-filter-response.dto';

import { PollDTO } from '../../../shared/models/polls/poll.dto';
import { UpdatePollDTO } from '../../../shared/models/polls/update-poll.dto';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-edit-poll',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './edit-poll.html',
  styleUrls: ['./edit-poll.css'],
})
export class EditPoll implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private calendarService = inject(CalendarService);
  private pollService = inject(PollService);

  calendars: CalendarOption[] = [];

  apiError = '';
  isSubmitting = false;
  isLoading = false;
  isLoadingCalendars = false;

  pollId = ''; // from route param

  // Inputs for add
  tagInput = '';
  optionInput = '';

  // “selected” items for delete-selected buttons
  selectedTagIndex: number | null = null;
  selectedOptionIndex: number | null = null;

  form!: FormGroup;

  ngOnInit(): void {
    // 1) get pollId from route
    const id = this.route.snapshot.paramMap.get('pollId');
    if (!id) {
      this.apiError = 'Missing poll id';
      return;
    }
    this.pollId = id;

    // 2) build form
    this.form = this.fb.group({
      calendarId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(1000)]],
      notes: ['', [Validators.maxLength(1000)]],

      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],

      // These exist in your CreatePollDTO / CreatePollResponseDTO.
      // If your edit UI doesn’t show them yet, it’s fine—defaults apply.
      results_visible: [true, Validators.required],
      allow_multiple_votes: [false, Validators.required],

      tags: this.fb.array<FormControl<string | null>>([]),
      options: this.fb.array<FormControl<string | null>>([]),
    });

    // 3) load calendars + poll
    this.loadCalendars();
    this.loadPoll(this.pollId);
  }

  // ---- getters ----
  get tags(): FormArray<FormControl<string | null>> {
    return this.form.get('tags') as FormArray<FormControl<string | null>>;
  }

  get options(): FormArray<FormControl<string | null>> {
    return this.form.get('options') as FormArray<FormControl<string | null>>;
  }

  get adminCalendars(): CalendarOption[] {
    return this.calendars.filter((c) => c.isAdmin);
  }

  // ----------------------------
  // Calendars: real data
  // ----------------------------
  private loadCalendars(): void {
    this.isLoadingCalendars = true;

    this.calendarService.getHomepage().subscribe({
      next: (home: CalendarHomeDTO) => {
        this.isLoadingCalendars = false;

        this.calendars = (home.calendars ?? []).map((c: CalendarSummaryDTO) => ({
          id: c.calendar_id,
          name: c.name,
          isAdmin: c.is_admin,
        }));

        // If no calendar is selected yet, default to first admin, else first calendar.
        const current = this.form.get('calendarId')?.value;
        if (!current) {
          const firstAdmin = this.calendars.find((c) => c.isAdmin);
          const firstAny = this.calendars[0];
          const selected = firstAdmin ?? firstAny;
          if (selected) {
            this.form.patchValue({ calendarId: selected.id }, { emitEvent: false });
          }
        }
      },
      error: (err) => {
        this.isLoadingCalendars = false;
        // Not fatal for editing a poll, but dropdown may be empty.
        console.warn('Could not load calendars', err);
      },
    });
  }

  // ----------------------------
  // Poll: real load
  // ----------------------------
  private loadPoll(pollId: string): void {
    this.apiError = '';
    this.isLoading = true;

    this.calendarService.getByPollIds([pollId]).subscribe({
      next: (res: CalendarFilterResponseDTO) => {
        this.isLoading = false;

        const poll = (res as any)?.polls?.[0] as PollDTO | undefined;

        if (!poll) {
          this.apiError = 'Poll not found';
          return;
        }

        this.patchFormFromPoll(poll);
      },
      error: (err) => {
        this.isLoading = false;
        this.apiError =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not load poll';
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
    (poll.tags ?? []).forEach((t) =>
      this.tags.push(this.fb.control(t, [Validators.required, Validators.maxLength(30)]))
    );

    this.options.clear();
    // PollDTO.options is PollOptionDTO[] (has description). Convert to strings for editing.
    (poll.options ?? []).forEach((opt) =>
      this.options.push(this.fb.control(opt.description ?? '', [Validators.required, Validators.maxLength(80)]))
    );

    // Ensure minimum options
    while (this.options.length < 2) {
      this.options.push(this.fb.control('', [Validators.required, Validators.maxLength(80)]));
    }
  }

  // ----------------------------
  // Timezone bug fix helpers
  // ----------------------------

  private parseServerInstant(iso: string): Date {
    // If server includes timezone (Z or ±hh:mm), parse normally.
    // If server sends "2026-01-22T18:00:00" with no timezone, assume UTC and append Z.
    const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);
    return new Date(hasTz ? iso : `${iso}Z`);
  }

  private isoToDateTime(iso: string): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };

    const d = this.parseServerInstant(iso);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const pad = (n: number) => String(n).padStart(2, '0');

    // Convert to LOCAL values for the input fields
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return { date, time };
  }

  private toLocalDate(date: string, time: string): Date | null {
    if (!date || !time) return null;

    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);

    if (![y, m, d, hh, mm].every(Number.isFinite)) return null;

    // Construct in LOCAL time zone (no string parsing ambiguity)
    const local = new Date(y, m - 1, d, hh, mm, 0, 0);
    return isNaN(local.getTime()) ? null : local;
  }

  // ----------------------------
  // Selection
  // ----------------------------
  selectTag(i: number): void {
    this.selectedTagIndex = i;
  }

  selectOption(i: number): void {
    this.selectedOptionIndex = i;
  }

  // ----------------------------
  // Tags actions
  // ----------------------------
  addTag(): void {
    this.apiError = '';
    const value = (this.tagInput || '').trim();
    if (!value) return;

    const exists = this.tags.controls.some((c) => (c.value || '').toLowerCase() === value.toLowerCase());
    if (exists) {
      this.apiError = 'Tag already exists.';
      return;
    }
    if (value.length > 30) {
      this.apiError = 'Tag is too long (max 30 chars).';
      return;
    }

    this.tags.push(this.fb.control(value, [Validators.required, Validators.maxLength(30)]));
    this.tagInput = '';
    this.selectedTagIndex = null;
  }

  deleteSelectedTag(): void {
    if (this.selectedTagIndex === null) return;
    this.tags.removeAt(this.selectedTagIndex);
    this.selectedTagIndex = null;
  }

  // ----------------------------
  // Options actions
  // ----------------------------
  addOption(): void {
    this.apiError = '';
    const value = (this.optionInput || '').trim();
    if (!value) return;

    if (this.options.length >= 20) {
      this.apiError = 'Max 20 options allowed.';
      return;
    }

    this.options.push(this.fb.control(value, [Validators.required, Validators.maxLength(80)]));
    this.optionInput = '';
    this.selectedOptionIndex = null;
  }

  deleteSelectedOption(): void {
    if (this.selectedOptionIndex === null) return;

    if (this.options.length <= 2) {
      this.apiError = 'A poll must have at least 2 options.';
      return;
    }

    this.options.removeAt(this.selectedOptionIndex);
    this.selectedOptionIndex = null;
  }

  // ----------------------------
  // Confirm edit (real backend update)
  // ----------------------------
  confirmEdit(): void {
    this.apiError = '';

    if (!this.pollId) {
      this.apiError = 'Missing poll id';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.apiError = 'Please fix validation errors.';
      return;
    }

    if (this.options.length < 2) {
      this.apiError = 'A poll must have at least 2 options.';
      return;
    }

    const v = this.form.getRawValue();

    const start = this.toLocalDate(String(v.startDate), String(v.startTime));
    const end = this.toLocalDate(String(v.endDate), String(v.endTime));

    if (!start || !end) {
      this.apiError = 'Start/End date-time is invalid.';
      return;
    }
    if (end.getTime() <= start.getTime()) {
      this.apiError = 'End must be after start.';
      return;
    }

    const tags = (v.tags ?? [])
      .map((t: string | null) => (t ?? '').trim())
      .filter((t: string) => t.length > 0);

    const optionDescriptions = (v.options ?? [])
      .map((o: string | null) => (o ?? '').trim())
      .filter((o: string) => o.length > 0);

    if (optionDescriptions.length < 2) {
      this.apiError = 'A poll must have at least 2 options.';
      return;
    }

    // Build UpdatePollDTO for your backend
    const dto: UpdatePollDTO = {
      calendar_id: String(v.calendarId),
      title: String(v.title),

      description: (v.description ?? '').trim() || undefined,
      notes: (v.notes ?? '').trim() || undefined,

      // Store as UTC instants (no cumulative +6 bug)
      start_time: start.toISOString(),
      end_time: end.toISOString(),

      results_visible: Boolean(v.results_visible),
      allow_multiple_votes: Boolean(v.allow_multiple_votes),

      // API expects { description }[]
      options: optionDescriptions.map((desc: string) => ({ description: desc })),

      tags,
    };

    this.isSubmitting = true;

    this.pollService.update(this.pollId, dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        // Navigate back to view page (adjust route to your app)
        this.router.navigate(['/view-poll', this.pollId]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.apiError =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Could not update poll';
      },
    });
  }

  // ---- delete poll (route to delete component) ----
  deletePoll(): void {
    this.router.navigate(['/delete-poll', this.pollId]);
  }

  cancel(): void {
    this.router.navigate(['/view-poll', this.pollId]);
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }
}
