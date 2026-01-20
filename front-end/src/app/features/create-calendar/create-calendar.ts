import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-calendar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-calendar.html',
})
export class CreateCalendar {
  name: string = '';
  response: string | null = null;

  constructor(private http: HttpClient) {}

  sendData(form: NgForm) {
    if (form.valid) {
        this.http.post<{ reply: string }>('/calendar', {
        name: this.name
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
    else {
        return;
    }
  }
}