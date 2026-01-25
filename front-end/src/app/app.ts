// import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { provideHttpClient } from '@angular/common/http';

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// import {
//   CalendarModule,
//   DateAdapter
// } from 'angular-calendar';

import { provideCalendar } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet],
  // providers: [
  //   provideCalendar({
  //     provide: DateAdapter,
  //     useFactory: adapterFactory,
  //   }),
  // ],
})
export class App {
  protected readonly title = signal('front-end');

  // viewDate = new Date();
  // events: CalendarEvent[] = [];
}
