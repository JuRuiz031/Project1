import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { BaseModal } from '../../../shared/components/base-modal/base-modal';

@Component({
  selector: 'app-delete-calendar-modal',
  standalone: true,
  imports: [CommonModule, BaseModal],
  templateUrl: './delete-calendar-modal.html',
  styleUrls: ['./delete-calendar-modal.css'],
})
export class DeleteCalendarModal {
  /**
   * Parent passes the selected calendar/group info into the modal.
   * (Keep names generic so main-page can reuse this for calendars or groups.)
   */
  targetId = input<string | null>(null);
  targetName = input('this item');

  /**
   * Parent-controlled request state (so parent owns the API call).
   */
  isDeleting = input(false);
  apiError = input('');

  /**
   * Modal -> parent events (parent decides what to do).
   */
  cancel = output<void>();
  confirmDelete = output<string>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    const id = this.targetId();
    if (!id || this.isDeleting()) return;
    this.confirmDelete.emit(id);
  }
}