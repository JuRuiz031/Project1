import { Component, OnInit } from '@angular/core';

import { CalendarDisplay } from './components/calendar-display/calendar-display';
import { CalendarOptions } from './components/calendar-options/calendar-options';
import { DisplayOptions } from './components/display-options/display-options';
import { PollsWindow } from './components/polls-window/polls-window';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CalendarDisplay,
    CalendarOptions,
    DisplayOptions,
    PollsWindow,
  ],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPageComponent implements OnInit {

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token) {
      console.log('Token exists in localStorage:', token);
    } else {
      console.log('No token found in localStorage');
    }

    if (userString) {
      console.log('User string in localStorage:', userString);
    } else {
      console.log('No user string found in localStorage');
    }
  }
}