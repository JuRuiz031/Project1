import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router) {}

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

    const payload = this.form.getRawValue();

    this.isSubmitting = true;
    console.log('Create account payload:', payload);

    // TODO: replace with AuthApiService.createAccount(payload).subscribe(...)
    setTimeout(() => {
      this.isSubmitting = false;
      // After successful account creation, return to login
      this.router.navigate(['/login']);
    }, 500);
  }

  cancel(): void {
    this.router.navigate(['/login']);
  }
}