import { Component } from '@angular/core';
import { BRAND_CONFIG } from '../../../../../config/brand.config';

@Component({
  selector: 'app-main-footer',
  standalone: true,
  imports: [],
  templateUrl: './main-footer.html',
  styleUrl: './main-footer.css',
})
export class MainFooter {
  readonly footerText = BRAND_CONFIG.footerText;
}
