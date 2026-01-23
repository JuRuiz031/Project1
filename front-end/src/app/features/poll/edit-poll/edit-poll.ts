import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-edit-poll',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './edit-poll.html',
  styleUrls: ['./edit-poll.css'],
})
export class EditPoll implements OnInit {

  showDeleteConfirm = false;
  deleteInProgress = false;


  // Mock calendars (replace with API later)
  calendars: CalendarOption[] = [
    { id: '1', name: 'My Admin Calendar', isAdmin: true },
    { id: '2', name: 'Shared Calendar (read-only)', isAdmin: false },
  ];

  apiError = '';
  isSubmitting = false;

  pollId = 'demo-poll-1'; // later: from route param

  // Inputs for add
  tagInput = '';
  optionInput = '';

  // “selected” items for delete-selected buttons
  selectedTagIndex: number | null = null;
  selectedOptionIndex: number | null = null;

  form!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    // Build form
    this.form = this.fb.group({
      calendarId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      tags: this.fb.array<FormControl<string | null>>([]),
      options: this.fb.array<FormControl<string | null>>([]),
    });

    // TODO later: load poll by id and patch form
    this.loadMockPoll();
  }

  // ---- getters ----
  get tags(): FormArray<FormControl<string | null>> {
    return this.form.get('tags') as FormArray<FormControl<string | null>>;
  }

  get options(): FormArray<FormControl<string | null>> {
    return this.form.get('options') as FormArray<FormControl<string | null>>;
  }

  get adminCalendars(): CalendarOption[] {
    return this.calendars.filter(c => c.isAdmin);
  }

  // ---- mock load ----
  private loadMockPoll(): void {
    const mock = {
      calendarId: '1',
      title: 'Where should we eat?',
      startDate: '2026-01-22',
      startTime: '18:00',
      endDate: '2026-01-23',
      endTime: '18:00',
      tags: ['food', 'team', 'friday'],
      options: ['Tacos', 'Pizza', 'Sushi', 'Burgers'],
    };

    this.form.patchValue({
      calendarId: mock.calendarId,
      title: mock.title,
      startDate: mock.startDate,
      startTime: mock.startTime,
      endDate: mock.endDate,
      endTime: mock.endTime,
    });

    this.tags.clear();
    mock.tags.forEach(t => this.tags.push(this.fb.control(t, [Validators.required, Validators.maxLength(30)])));

    this.options.clear();
    mock.options.forEach(o => this.options.push(this.fb.control(o, [Validators.required, Validators.maxLength(80)])));
  }

  // ---- selection ----
  selectTag(i: number): void {
    this.selectedTagIndex = i;
  }

  selectOption(i: number): void {
    this.selectedOptionIndex = i;
  }

  // ---- tags actions ----
  addTag(): void {
    this.apiError = '';
    const value = (this.tagInput || '').trim();
    if (!value) return;

    const exists = this.tags.controls.some(c => (c.value || '').toLowerCase() === value.toLowerCase());
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

  // ---- options actions ----
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

  // ---- confirm edit ----
  confirmEdit(): void {
    this.apiError = '';

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

    const start = new Date(`${v.startDate}T${v.startTime}:00`);
    const end = new Date(`${v.endDate}T${v.endTime}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.apiError = 'Start/End date-time is invalid.';
      return;
    }
    if (end <= start) {
      this.apiError = 'End must be after start.';
      return;
    }

    const payload = {
      poll_id: this.pollId,
      calendar_id: v.calendarId,
      title: v.title,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      tags: (v.tags ?? [])
        .filter((t: string | null) => typeof t === 'string' && t.trim().length > 0)
        .map((t: string | null) => (t ?? '').trim()),
      options: (v.options ?? [])
        .filter((o: string | null) => typeof o === 'string' && o.trim().length > 0)
        .map((o: string | null) => (o ?? '').trim()),
    };

    // TODO: PollApiService.updatePoll(this.pollId, payload).subscribe(...)
    this.isSubmitting = true;
    console.log('UpdatePoll payload:', payload);

    setTimeout(() => {
      this.isSubmitting = false;
      // return to view poll
      this.router.navigate(['/view-poll']);
      // later: this.router.navigate(['/view-poll', this.pollId]);
    }, 400);
  }

  openDeleteConfirm(): void {
  this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
  }

  confirmDeletePoll(): void {
    this.apiError = '';
    this.deleteInProgress = true;

    // TODO: PollApiService.deletePoll(this.pollId).subscribe(...)
    console.log('Deleting poll:', this.pollId);

    setTimeout(() => {
      this.deleteInProgress = false;
      this.showDeleteConfirm = false;
      this.router.navigate(['/dashboard']); // change if needed
    }, 400);
  }

  // ---- delete poll ----
  deletePoll(): void {
    this.openDeleteConfirm();
}


  cancel(): void {
    this.router.navigate(['/view-poll']);
    // later: this.router.navigate(['/view-poll', this.pollId]);
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  calendarNameForSelectedId(calendarId: string | null | undefined): string {
    const id = calendarId ?? '';
    const found = this.calendars.find(c => c.id === id);
    return found?.name ?? 'Unknown Calendar';
  }

}
