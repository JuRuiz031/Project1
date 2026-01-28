import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { UserApiService } from '../../../shared/services/api/user-api.service';
import { NavigationService } from '../../../shared/services/navigation.service';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-account.html',
  styleUrl: './create-account.css',
})
export class CreateAccount {
  private fb = inject(FormBuilder);
  private navigation = inject(NavigationService);
  private userApi = inject(UserApiService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  apiError = signal('');
  isSubmitting = signal(false);

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  createAccount(): void {
    this.apiError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.apiError.set('Please fix validation errors.');
      return;
    }

    const raw = this.form.getRawValue();

    const dto = {
      username: String(raw.name ?? ''),
      email: String(raw.email ?? ''),
      password: String(raw.password ?? ''),
    };

    this.isSubmitting.set(true);

    this.userApi
      .register(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.navigation.goToLogin();
        },
        error: (err) => {
          const message =
            (err?.error && typeof err.error === 'string' && err.error) ||
            err?.error?.message ||
            err?.message;

          this.apiError.set(message || 'Failed to create account. Please try again.');
        },
      });
  }

  cancel(): void {
    this.navigation.goToLogin();
  }
}
