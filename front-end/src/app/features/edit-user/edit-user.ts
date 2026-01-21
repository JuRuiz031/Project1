import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserApiService } from '../../services/user-api.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.html',
  styleUrls: ['./edit-user.css']
})
export class EditUser implements OnInit {
  isSaving = false;
  apiError = '';
  userId = '';

  private fb = inject(FormBuilder);
  private userApi = inject(UserApiService);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]],
  });

  ngOnInit(): void {
    this.userId = this.getUserIdFromStorage();
    if (!this.userId) {
      this.apiError = 'No user logged in.';
      return;
    }

    this.userApi.getUserById(this.userId).subscribe({
      next: (u) => this.form.patchValue({ username: u.username, email: u.email, password: '' }),
      error: (err) => this.apiError = err?.error?.message ?? 'Failed to load user.'
    });
  }

  save(): void {
    this.apiError = '';
    if (this.form.invalid || !this.userId) return;

    this.isSaving = true;
    this.userApi.updateUser(this.userId, this.form.value as any).subscribe({
      next: () => this.isSaving = false,
      error: (err) => {
        this.isSaving = false;
        this.apiError = err?.error?.message ?? 'Update failed.';
      }
    });
  }

  private getUserIdFromStorage(): string {
    const raw = localStorage.getItem('auth');
    if (!raw) return '';
    try {
      const auth = JSON.parse(raw);
      return auth?.user?.user_id ?? auth?.user?.id ?? '';
    } catch {
      return '';
    }
  }

  showDeleteConfirm = false;

  openDeleteConfirm() {
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
  }

  // später: hier kommt deleteUser() rein
  confirmDelete() {
    // TODO: DELETE call + logout + navigate
    this.showDeleteConfirm = false;
  }


  
}
