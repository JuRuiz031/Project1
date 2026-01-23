import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router) {}

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
      newPassword: [
        '',
        [Validators.minLength(8)],
      ],
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

    const payload = {
      name,
      email,
      // only send password if user entered one
      ...(newPassword ? { newPassword } : {}),
    };

    this.isSubmitting = true;
    console.log('Edit profile payload:', payload);

    // TODO: replace with UserApiService.updateProfile(payload).subscribe(...)
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/account']);
    }, 400);
  }

  cancel(): void {
    this.router.navigate(['/account']);
  }

  deleteProfile(): void {
    // Match your existing delete flows later
    this.router.navigate(['/delete-user']);
  }
}
