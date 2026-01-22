import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { BRAND_CONFIG } from '../../../config/brand.config';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './main-header.html',
  styleUrl: './main-header.css',
})
export class MainHeader {
  readonly siteName = BRAND_CONFIG.siteName;

  @Input() showProfile = true;
}
