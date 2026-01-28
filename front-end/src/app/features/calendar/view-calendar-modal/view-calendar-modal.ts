import { Component, input, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-calendar-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-calendar-modal.html',
  styleUrl: './view-calendar-modal.css',
})
export class ViewCalendarModal implements OnDestroy {
  calendarId = input<string | null>(null);

  back = output<void>();
  close = output<void>();

  constructor() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  onBack(): void {
    this.back.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
