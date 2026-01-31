import { Component, input, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable base modal component
 * Handles overlay, content container, header, and body structure
 * 
 * Usage:
 * ```html
 * <app-base-modal 
 *   [title]="'My Modal Title'" 
 *   [showBackButton]="true"
 *   (close)="handleClose()"
 *   (back)="handleBack()">
 *   
 *   <!-- Your modal content here -->
 *   <div class="mb-3">
 *     <label>Field</label>
 *     <input type="text" class="form-control" />
 *   </div>
 * 
 * </app-base-modal>
 * ```
 */
@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-modal.html',
  styleUrls: ['./base-modal.css'],
})
export class BaseModal implements OnDestroy {
  // Inputs
  title = input<string>('');
  subtitle = input<string>('');
  showBackButton = input<boolean>(false);
  size = input<'small' | 'medium' | 'large'>('medium'); // small: 500px, medium: 700px, large: 900px
  headerStyle = input<'default' | 'gradient'>('default');
  zIndex = input<number>(1000); // Allow override for overlay modals
  
  // Outputs
  close = output<void>();
  back = output<void>();

  constructor() {
    // Disable body scroll when modal opens
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Re-enable body scroll when modal closes
    document.body.style.overflow = '';
  }

  onClose(): void {
    this.close.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
