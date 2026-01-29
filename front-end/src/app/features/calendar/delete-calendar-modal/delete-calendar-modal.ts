import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

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
  @Input() targetId: string | null = null;
  @Input() targetName = 'this item';

  /**
   * Parent-controlled request state (so parent owns the API call).
   */
  @Input() isDeleting = false;
  @Input() apiError = '';

  /**
   * Modal -> parent events (parent decides what to do).
   */
  @Output() cancel = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<string>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    if (!this.targetId || this.isDeleting) return;
    this.confirmDelete.emit(this.targetId);
  }
}