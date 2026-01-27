import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BRAND_CONFIG } from '../../../config/brand.config';
import { LoginRequestDTO } from '../../../shared/models/auth/login-request.dto';
import { UserApiService } from '../../../shared/services/api/user-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly BYPASS_AUTH = false;
  private userApi = inject(UserApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(5)]],
  });

  errorMessage = signal('');
  readonly siteName = BRAND_CONFIG.siteName;

  onLogin(event?: Event) {
    event?.preventDefault();

    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.BYPASS_AUTH) {
      localStorage.setItem('token', 'dev-bypass-token');
      localStorage.setItem('user', JSON.stringify({
        user_id: 0,
        username: String(this.form.value.username ?? 'dev'),
        email: 'dev@example.com',
        is_superuser: true,
      }));
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
        if ([401, 403].includes(err?.status)) {
          this.errorMessage.set('Invalid username or password');
        } else {
          this.errorMessage.set(
            err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            'Login failed'
          );
        }
      },
    });
  }
}
