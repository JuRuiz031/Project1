import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { UserApiService, UpdateUserDTO } from '../../../shared/services/api/user-api.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userApi = inject(UserApiService);

  form: FormGroup;
  apiError = signal('');
  isSubmitting = signal(false);
  userId = signal('');

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      newPassword: ['', [Validators.minLength(8)]],
    });

    this.loadUserData();
  }

  private loadUserData(): void {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        this.apiError.set('No user found in session');
        return;
      }

      const userData = JSON.parse(userString);
      const userId = String(userData.user_id ?? '');
      this.userId.set(userId);

      if (!userId) {
        this.apiError.set('Invalid user data');
        return;
      }

      this.userApi.getUserById(userId).subscribe({
        next: (fullUser: any) => {
          this.form.patchValue({
            name: fullUser.username ?? '',
            email: fullUser.email ?? '',
          });
        },
        error: (err) => {
          console.error('Failed to fetch user details:', err);
          this.apiError.set('Failed to load user details');
        },
      });
    } catch (err) {
      this.apiError.set('Failed to load user data');
    }
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  save(): void {
    this.apiError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.apiError.set('Please fix validation errors.');
      return;
    }

    const { name, email, newPassword } = this.form.getRawValue();

    const dto: UpdateUserDTO = {
      username: name,
      email,
      ...(newPassword ? { password: newPassword } : {}),
    };

    this.isSubmitting.set(true); // UI Updates immediately

    this.userApi
      .updateUser(this.userId(), dto)
      .pipe(
        catchError(() => {
          this.apiError.set('Could not update profile. Please try again.');
          return of(null);
        }),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe((res) => {
        if (res) this.router.navigate(['/account']);
      });
  }

  cancel(): void {
    this.router.navigate(['/account']);
  }

  deleteProfile(): void {
    this.router.navigate(['/delete-user']);
  }
}
