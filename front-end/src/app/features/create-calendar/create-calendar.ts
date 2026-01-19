import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  sendData() {
    this.http.post<{ reply: string }>('/backend', {
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
}