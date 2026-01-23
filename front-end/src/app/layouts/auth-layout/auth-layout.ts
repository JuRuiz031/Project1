import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MainHeader } from '../../features/shared/main-header/main-header';
import { MainFooter } from '../../features/shared/main-footer/main-footer';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MainHeader, MainFooter],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {}
