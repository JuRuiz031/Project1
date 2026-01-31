import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserApiService, UpdateUserDTO } from '../../../shared/services/api/user-api.service';
import { NavigationService } from '../../../shared/services/navigation.service';
import { DeleteUserModalComponent } from '../delete-user-modal/delete-user-modal.component';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DeleteUserModalComponent],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser {
  private fb = inject(FormBuilder);
  private navigation = inject(NavigationService);
  private userApi = inject(UserApiService);

  form: FormGroup;
  apiError = signal('');
  isSubmitting = signal(false);
  userId = signal('');
  originalUsername = signal('');
  originalEmail = signal('');
  showDeleteModal = signal(false);

  // Convert form value changes to a signal (initialized after form)
  formValues = signal<any>({});

  // Computed: check if any actual changes were made
  hasChanges = computed(() => {
    const values = this.formValues();
    const currentName = values?.name || '';
    const currentEmail = values?.email || '';
    const newPassword = values?.newPassword || '';

    return (
      currentName !== this.originalUsername() ||
      currentEmail !== this.originalEmail() ||
      newPassword.length > 0
    );
  });

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.minLength(8)]],
    });

    // Subscribe to form changes and update signal
    this.form.valueChanges.subscribe(values => {
      this.formValues.set(values);
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
          this.originalUsername.set(fullUser.username ?? '');
          this.originalEmail.set(fullUser.email ?? '');
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
      return;
    }

    const { name, email, currentPassword, newPassword } = this.form.getRawValue();
    const usernameChanged = name !== this.originalUsername();

    this.isSubmitting.set(true);

    // First, verify the current password by attempting to login
    this.userApi.login({
      username: this.originalUsername(),
      password: currentPassword || '',
    }).pipe(
      catchError((err) => {
        this.isSubmitting.set(false);
        this.apiError.set('Incorrect password.');
        return of(null);
      })
    ).subscribe((loginResult) => {
      if (!loginResult) return; // Login failed, error already set

      // Password verified, now update the profile
      const dto: UpdateUserDTO = {
        username: name,
        email,
        ...(newPassword ? { password: newPassword } : {}),
      };

      this.userApi
        .updateUser(this.userId(), dto)
        .pipe(
          catchError((err) => {
            this.apiError.set('Could not update profile. Please try again.');
            return of(null);
          }),
          finalize(() => this.isSubmitting.set(false))
        )
        .subscribe((res) => {
          if (res) {
            // If username changed, re-login to get fresh token
            if (usernameChanged) {
              const loginDto = {
                username: name,
                password: newPassword || currentPassword || '',
              };

              this.userApi.login(loginDto).subscribe({
                next: (loginResponse) => {
                  localStorage.setItem('token', loginResponse.token);
                  localStorage.setItem('user', JSON.stringify(loginResponse.user));
                  localStorage.setItem('expiresAt', loginResponse.expires_at);
                  this.navigation.goToAccount({ success: true });
                },
                error: () => {
                  this.apiError.set('Profile updated but could not re-authenticate. Please login again.');
                  setTimeout(() => {
                    localStorage.clear();
                    this.navigation.goToLogin();
                  }, 2000);
                },
              });
            } else {
              // Username didn't change, just update localStorage with new data
              localStorage.setItem('user', JSON.stringify(res));
              this.navigation.goToAccount({ success: true });
            }
          }
        });
    });
  }

  cancel(): void {
    this.navigation.goToAccount();
  }

  deleteProfile(): void {
    this.showDeleteModal.set(true);
  }

  onDeleteCancelled(): void {
    this.showDeleteModal.set(false);
  }

  onDeleteConfirmed(): void {
    this.showDeleteModal.set(false);
    // Navigation to login happens in the modal component
  }
}
