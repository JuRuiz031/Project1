import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { UserApiService } from '../../../services/user-api.service';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-account.html',
  styleUrl: './create-account.css',
})
export class CreateAccount implements OnInit {
  form!: FormGroup;

  apiError = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userApi: UserApiService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  createAccount(): void {
    this.apiError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.apiError = 'Please fix validation errors.';
      return;
    }

    const raw = this.form.getRawValue();

    // Endpoint DTO mapping: UI "name" -> API "username"
    const dto = {
      username: raw.name,
      email: raw.email,
      password: raw.password,
    };

    this.isSubmitting = true;

    // POST /api/v1/users
    this.userApi
      .register(dto)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          // After successful account creation, return to login
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const message =
            (err?.error && typeof err.error === 'string' && err.error) ||
            err?.error?.message ||
            err?.message;

          this.apiError = message || 'Failed to create account. Please try again.';
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/login']);
  }
}
