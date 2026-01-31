// edit-user.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { EditUser } from './edit-user';
import { UserApiService } from '../../../shared/services/api/user-api.service';

// Vitest globals (no Jasmine)
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('EditUser', () => {
  let fixture: ComponentFixture<EditUser>;
  let component: EditUser;

  const routerMock = {
    navigate: vi.fn(),
  };

  const userApiMock = {
    updateUser: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [EditUser],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserApiService, useValue: userApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditUser);
    component = fixture.componentInstance;
    fixture.detectChanges(); // runs ngOnInit and builds the form
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeTruthy();
  });

  it('cancel() should navigate to /account', () => {
    component.cancel();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/account']);
  });

  it('deleteProfile() should show delete modal', () => {
    expect(component.showDeleteModal()).toBe(false);
    component.deleteProfile();
    expect(component.showDeleteModal()).toBe(true);
  });

  it('save() should block submit when form invalid, mark touched, and show apiError', () => {
    // Make invalid: clear required name/email
    component.form.patchValue({ name: '', email: '' });

    component.save();

    expect(userApiMock.updateUser).not.toHaveBeenCalled();
    expect(component.apiError).toBe('Please fix validation errors.');
    expect(component.form.get('name')?.touched).toBe(true);
    expect(component.form.get('email')?.touched).toBe(true);
  });

  it('save() should call PATCH /users/{id} via updateUser() and navigate to /account on success', () => {
    userApiMock.updateUser.mockReturnValue(
      of({ user_id: 3, username: 'Jane Doe', email: 'jane@example.com' })
    );

    component.form.patchValue({
      name: 'Jane Doe',
      email: 'jane@example.com',
      newPassword: '',
    });

    component.save();

    expect(userApiMock.updateUser).toHaveBeenCalledTimes(1);

    // DTO mapping: name -> username, newPassword -> password (only if present)
    expect(userApiMock.updateUser).toHaveBeenCalledWith(
      '3',
      { username: 'Jane Doe', email: 'jane@example.com' }
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['/account']);
  });

  it('save() should include password when newPassword is provided', () => {
    userApiMock.updateUser.mockReturnValue(
      of({ user_id: '3', username: 'Jane Doe', email: 'jane@example.com' })
    );

    component.form.patchValue({
      name: 'Jane Doe',
      email: 'jane@example.com',
      newPassword: 'password123',
    });

    component.save();

    expect(userApiMock.updateUser).toHaveBeenCalledWith(
      '3',
      { username: 'Jane Doe', email: 'jane@example.com', password: 'password123' }
    );
  });

  it('save() should set apiError and not navigate when updateUser() fails', () => {
    userApiMock.updateUser.mockReturnValue(throwError(() => new Error('boom')));

    component.form.patchValue({
      name: 'Jane Doe',
      email: 'jane@example.com',
      newPassword: '',
    });

    component.save();

    expect(component.apiError).toBe('Could not update profile. Please try again.');
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/account']);
  });
});
