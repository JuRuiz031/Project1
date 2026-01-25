// edit-user.ts
import { Component, OnInit } from '@angular/core';
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
export class EditUser implements OnInit {
  form!: FormGroup;

  apiError = '';
  isSubmitting = false;

  // TODO: replace with real user_id from auth/login status
  private readonly userId = '3';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userApi: UserApiService
  ) {}

  ngOnInit(): void {
    // TODO: Replace with real user data from auth/user service
    const existingUser = {
      name: 'Jane Doe',
      email: 'jane@example.com',
    };

    this.form = this.fb.group({
      name: [
        existingUser.name,
        [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
      ],
      email: [
        existingUser.email,
        [Validators.required, Validators.email, Validators.maxLength(120)],
      ],
      newPassword: ['', [Validators.minLength(8)]],
    });
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  save(): void {
    this.apiError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.apiError = 'Please fix validation errors.';
      return;
    }

    const { name, email, newPassword } = this.form.getRawValue();

    // Map UI fields -> endpoint DTO fields (PATCH /users/{id})
    const dto: UpdateUserDTO = {
      username: name,
      email,
      ...(newPassword ? { password: newPassword } : {}),
    };

    this.isSubmitting = true;

    this.userApi
      .updateUser(this.userId, dto)
      .pipe(
        catchError(() => {
          this.apiError = 'Could not update profile. Please try again.';
          return of(null);
        }),
        finalize(() => (this.isSubmitting = false))
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
