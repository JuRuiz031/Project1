import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BRAND_CONFIG } from '../../../config/brand.config';
import { LoginRequestDTO } from '../../../shared/models/auth/login-request.dto';
import { UserApiService } from '../../../services/user-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  /** TEMP: set true to bypass backend auth while backend is being fixed */
  private readonly BYPASS_AUTH = false;

  form: FormGroup;
  errorMessage: string = '';
  readonly siteName = BRAND_CONFIG.siteName;

  constructor(
    private userApi: UserApiService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onLogin(event?: Event) {
    event?.preventDefault();
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // ✅ BYPASS MODE: skip API call, go straight to main page
    if (this.BYPASS_AUTH) {
      localStorage.setItem('token', 'dev-bypass-token');
      localStorage.setItem(
        'user',
        JSON.stringify({
          user_id: 0,
          username: String(this.form.value.username ?? 'dev'),
          email: 'dev@example.com',
          is_superuser: true,
        })
      );

      this.router.navigateByUrl('/dashboard/main-page');
      return;
    }

    const dto: LoginRequestDTO = {
      username: String(this.form.value.username ?? ''),
      password: String(this.form.value.password ?? ''),
    };

    this.userApi.login(dto).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.router.navigateByUrl('/dashboard/main-page');
      },
      error: (err) => {
        const message =
          (err?.error && typeof err.error === 'string' && err.error) ||
          err?.error?.message ||
          err?.message;

        this.errorMessage = message || 'Login failed';
      },
    });
  }
}
