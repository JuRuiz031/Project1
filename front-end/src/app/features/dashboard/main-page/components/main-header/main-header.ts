import { Component } from '@angular/core';
import { BRAND_CONFIG } from '../../../../../config/brand.config';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [],
  templateUrl: './main-header.html',
  styleUrl: './main-header.css',
})
export class MainHeader {
  readonly siteName = BRAND_CONFIG.siteName;
}
