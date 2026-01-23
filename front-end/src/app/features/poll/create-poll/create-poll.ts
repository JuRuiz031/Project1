import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

type CalendarOption = { id: string; name: string; isAdmin: boolean };

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.html',
  styleUrls: ['./create-poll.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class CreatePoll implements OnInit {

  // Mock calendars for now (replace later with API)
  calendars: CalendarOption[] = [
    { id: '1', name: 'My Admin Calendar', isAdmin: true },
    { id: '2', name: 'Shared Calendar (read-only)', isAdmin: false },
  ];

  apiError = '';
  isSubmitting = false;

  // Input fields for tag/option “add”
  tagInput = '';
  optionInput = '';

  form!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      calendarId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      tags: this.fb.array([]),
      options: this.fb.array([
        this.fb.control('Option 1', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
        this.fb.control('Option 2', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      ]),
    });

    // Default: first admin calendar
    const firstAdmin = this.adminCalendars[0];
    if (firstAdmin) this.form.patchValue({ calendarId: firstAdmin.id });
  }

  // Convenience getters
  get tags(): FormArray<FormControl<string | null>> {
  return this.form.get('tags') as FormArray<FormControl<string | null>>;
}

  get options(): FormArray<FormControl<string | null>> {
    return this.form.get('options') as FormArray<FormControl<string | null>>;
  }


  get adminCalendars(): CalendarOption[] {
    return this.calendars.filter(c => c.isAdmin);
  }

  // ---------- TAGS ----------
  addTag(): void {
    this.apiError = '';
    const value = (this.tagInput || '').trim();

    if (!value) return;

    // prevent duplicates (case-insensitive)
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
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  // ---------- OPTIONS ----------
  addOption(): void {
    this.apiError = '';
    const value = (this.optionInput || '').trim();
    if (!value) return;

    if (this.options.length >= 20) {
      this.apiError = 'Max 20 options allowed.';
      return;
    }

    this.options.push(this.fb.control(value, [Validators.required, Validators.minLength(1), Validators.maxLength(80)]));
    this.optionInput = '';
  }

  removeOption(index: number): void {
    if (this.options.length <= 2) {
      this.apiError = 'A poll must have at least 2 options.';
      return;
    }
    this.options.removeAt(index);
  }

  // ---------- SUBMIT ----------
  submit(): void {
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

    // Build payload (future backend DTO)
    const payload = {
      calendar_id: v.calendarId,
      title: v.title,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      tags: (v.tags || []).filter((t: string) => !!t?.trim()),
      options: (v.options || []).map((o: string) => o.trim()).filter((o: string) => o.length > 0),
    };

    // TODO: Replace with PollApiService.createPoll(payload).subscribe(...)
    this.isSubmitting = true;
    console.log('CreatePoll payload:', payload);

    // mock success
    setTimeout(() => {
      this.isSubmitting = false;
      // go back to dashboard (change route as needed)
      this.router.navigate(['/main-page']);
    }, 400);
  }

  cancel(): void {
    this.router.navigate(['/main-page']);
  }

  // helpers for template
  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }
}
