import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BRAND_CONFIG } from '../../../config/brand.config';
import { LoginRequestDTO } from '../../../shared/models/auth/login-request.dto';
import { UserApiService } from '../../../services/user-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
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
        this.errorMessage = err?.error?.message || 'Login failed';
      },
    });
  }
}
