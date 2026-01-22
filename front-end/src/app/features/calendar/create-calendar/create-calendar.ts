import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-calendar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-calendar.html',
})
export class CreateCalendar {
  form: FormGroup;
  response: string | null = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]]
    });
  }

  sendData() {
    if (this.form.valid) {
      this.http.post<{ reply: string }>('/calendar', {
        name: this.form.get('name')?.value
      }).subscribe({
        next: (res) => {
          this.response = res.reply;
        },
        error: (err) => {
          console.error(err);
          this.response = 'Error sending data';
        }
      });
    }
  }
}