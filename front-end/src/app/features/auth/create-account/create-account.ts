import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { UserRegistrationDTO } from '../../../shared/models/auth/user-registration.dto';

@Component({
  selector: 'app-create-account',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './create-account.html',
  styleUrl: './create-account.css',
})
export class CreateAccount {
  form: FormGroup;
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
      passwordConfirm: ['', Validators.required]
    });
  }

  onCreateAccount() {
    if (this.form.get('password')?.value !== this.form.get('passwordConfirm')?.value) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.userService.register(this.form.value).subscribe({
      next: (response) => {
        console.log('User created:', response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
}
