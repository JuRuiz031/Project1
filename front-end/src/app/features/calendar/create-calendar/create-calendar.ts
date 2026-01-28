import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// intial commit comment

@Component({
  selector: 'app-create-calendar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-calendar.html',
  styleUrl: './create-calendar.css',
})
export class CreateCalendar {
  form: FormGroup;
  response: string | null = null;

  constructor(private http: HttpClient, private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
    });
  }

  sendData() {
    if (this.form.valid) {
      this.http
        .post<{ reply: string }>('/calendar', {
          name: this.form.get('name')?.value,
        })
        .subscribe({
          next: (res) => {
            this.response = res.reply;
            this.router.navigate(['/main-page']);
          },
          error: (err) => {
            console.error(err);
            this.response = 'Error sending data';
          },
        });
    }
  }

  cancel() {
    this.router.navigate(['/main-page']);
  }
}
