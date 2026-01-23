import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MainHeader } from '../../features/shared/main-header/main-header';
import { MainFooter } from '../../features/shared/main-footer/main-footer';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, MainHeader, MainFooter],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {}
