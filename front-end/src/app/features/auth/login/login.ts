import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { BRAND_CONFIG } from '../../../config/brand.config';
import { LoginRequestDTO } from '../../../shared/models/auth/login-request.dto';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form: FormGroup;
  errorMessage: string = '';
  readonly siteName = BRAND_CONFIG.siteName;

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  /* TEMPORARY LOGIN FUNCTION
  *  REMOVE ONCE PAGE TRAVERSAL IS CONFIRMED
  */
  onLogin(event?: Event) {
    event?.preventDefault();
    console.log('DEV login bypass');

    // optional: fake “logged in” state
    localStorage.setItem('token', 'dev-token');
    localStorage.setItem('user', JSON.stringify({ username: this.form.value.username }));

    this.router.navigateByUrl('/dashboard/main-page');
  }

  /* ORIGINAL LOGIN FUNCTION
  *  RESTORE AFTER CONFIRMING PAGE NAVIGATION
  onLogin() {
    console.log('onLogin fired');
    
    if (this.form.invalid) {
      return;
    }

    this.userService.login(this.form.value).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        // TODO: Store token in localStorage or state management
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // ✅ Navigate to dashboard main page
        this.router.navigate(['/dashboard/main-page']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = err.error?.message || 'Login failed';
      }
    });
  }
  */
 
}

