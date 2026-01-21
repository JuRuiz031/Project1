import { Component } from '@angular/core';

import { MainHeader } from './components/main-header/main-header';
import { MainFooter } from './components/main-footer/main-footer';

import { CalendarDisplay } from './components/calendar-display/calendar-display';
import { CalendarOptions } from './components/calendar-options/calendar-options';
import { DisplayOptions } from './components/display-options/display-options';
import { PollsWindow } from './components/polls-window/polls-window';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    MainHeader,
    MainFooter,
    CalendarDisplay,
    CalendarOptions,
    DisplayOptions,
    PollsWindow,
  ],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPageComponent {}
