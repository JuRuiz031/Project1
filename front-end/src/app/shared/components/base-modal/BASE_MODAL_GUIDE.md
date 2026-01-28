# Base Modal Component Guide

A reusable modal component for creating consistent modals across the app.

## Location

```
shared/components/base-modal/base-modal.ts
```

## Quick Start

### 1. Import the Component

```typescript
import { BaseModal } from '../../../shared/components/base-modal/base-modal';

@Component({
  standalone: true,
  imports: [BaseModal],
  // ...
})
```

### 2. Basic Usage

```html
<app-base-modal 
  [title]="'My Modal Title'" 
  (close)="onClose()">
  
  <!-- Your content goes here -->
  <p>Hello, this is my modal content!</p>
  
</app-base-modal>
```

---

## Inputs & Outputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `''` | Modal header title |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Modal width (500px / 700px / 900px) |
| `showBackButton` | `boolean` | `false` | Shows a "← Back" button in header |
| `(close)` | `EventEmitter<void>` | - | Fires when user clicks X or backdrop |
| `(back)` | `EventEmitter<void>` | - | Fires when user clicks Back button |

---

## Examples

### Simple Confirmation Modal (Delete)

```html
<app-base-modal 
  [title]="'Delete Event'" 
  [size]="'small'"
  (close)="onClose()">

  <div class="text-center">
    <p>Are you sure you want to delete <strong>{{ itemName }}</strong>?</p>
    
    <div class="d-flex justify-content-center gap-3">
      <button class="btn btn-danger" (click)="confirmDelete()">Delete</button>
      <button class="btn btn-outline-secondary" (click)="onClose()">Cancel</button>
    </div>
  </div>

</app-base-modal>
```

### Form Modal (Create/Edit)

```html
<app-base-modal 
  [title]="'Create Calendar'" 
  (close)="onClose()">

  <form [formGroup]="form" (ngSubmit)="submit()">
    <!-- Error message -->
    @if (apiError) {
      <div class="alert alert-danger mb-3">{{ apiError }}</div>
    }

    <!-- Form fields -->
    <div class="mb-3">
      <label class="form-label">Calendar Name</label>
      <input type="text" class="form-control" formControlName="name" />
    </div>

    <div class="mb-3">
      <label class="form-label">Description</label>
      <textarea class="form-control" formControlName="description"></textarea>
    </div>

    <!-- Submit buttons -->
    <div class="d-flex justify-content-end gap-2 mt-4">
      <button type="button" class="btn btn-outline-secondary" (click)="onClose()">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
        {{ isSubmitting ? 'Creating...' : 'Create' }}
      </button>
    </div>
  </form>

</app-base-modal>
```

### Modal with Back Button (Multi-step)

```html
<app-base-modal 
  [title]="'View Poll'" 
  [showBackButton]="true"
  (close)="onClose()"
  (back)="goBack()">

  <!-- Read-only content -->
  <div class="mb-3">
    <label class="form-label">Poll Title</label>
    <input type="text" class="form-control" [value]="pollTitle" disabled />
  </div>

  <div class="d-flex justify-content-end gap-2 mt-4">
    <button class="btn btn-primary" (click)="openEdit()">Edit</button>
  </div>

</app-base-modal>
```

---

## Component Skeleton

Copy this template when creating a new modal:

**my-modal.ts**
```typescript
import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseModal } from '../../../shared/components/base-modal/base-modal';

@Component({
  selector: 'app-my-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseModal],
  templateUrl: './my-modal.html',
  styleUrls: ['./my-modal.css'],
})
export class MyModal {
  private fb = inject(FormBuilder);

  // Inputs (if needed)
  itemId = input<string>('');

  // Outputs
  close = output<void>();
  itemSaved = output<string>();

  // State
  apiError = '';
  isSubmitting = false;

  form = this.fb.group({
    name: ['', [Validators.required]],
  });

  onClose(): void {
    this.close.emit();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    // Call your service here...
  }
}
```

**my-modal.html**
```html
<app-base-modal [title]="'My Modal'" (close)="onClose()">
  <!-- Your content -->
</app-base-modal>
```

---

## Using Modals in Parent Components

Control modal visibility with a state signal:

```typescript
// Parent component
modalState = signal<'none' | 'create' | 'view' | 'edit' | 'delete'>('none');
selectedItemId = signal<string | null>(null);

openCreate(): void {
  this.modalState.set('create');
}

openEdit(id: string): void {
  this.selectedItemId.set(id);
  this.modalState.set('edit');
}

closeModals(): void {
  this.modalState.set('none');
  this.selectedItemId.set(null);
}

onItemCreated(id: string): void {
  this.refreshData();
  this.closeModals();
}
```

```html
<!-- Parent template -->
@if (modalState() === 'create') {
  <app-create-modal
    (close)="closeModals()"
    (itemCreated)="onItemCreated($event)">
  </app-create-modal>
}

@if (modalState() === 'edit') {
  <app-edit-modal
    [itemId]="selectedItemId()!"
    (close)="closeModals()"
    (itemUpdated)="onItemUpdated($event)">
  </app-edit-modal>
}
```

---

## Features Included

- ✅ Click backdrop to close
- ✅ Centered & responsive
- ✅ Disables body scroll when open
- ✅ Smooth open animation
- ✅ Three size variants
- ✅ Optional back button
- ✅ Content projection with `<ng-content>`

---

## Tips

1. **Use `size="small"`** for confirmations/deletions
2. **Use `size="medium"`** for standard forms (default)
3. **Use `size="large"`** for complex forms with lots of fields
4. **Always handle `(close)`** to properly reset state
5. **Show loading states** with `[disabled]="isSubmitting"` on buttons
