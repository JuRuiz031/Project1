import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-display-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-options.html',
  styleUrl: './display-options.css',
})
export class DisplayOptions {
  // Placeholder data only (replace with real calendars/tags later)
  calendars: string[] = ['Calendar 1', 'Calendar 2'];
  tags: string[] = ['Tag 1', 'Tag 2', 'Tag 3'];
}
