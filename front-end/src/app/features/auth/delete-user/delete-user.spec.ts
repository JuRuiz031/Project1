import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { DeleteUser } from './delete-user';
import { Router } from '@angular/router';
import { UserApiService } from '../../../shared/services/api/user-api.service';

describe('DeleteUser', () => {
  let fixture: ComponentFixture<DeleteUser>;
  let component: DeleteUser;

  const routerMock = {
    navigateByUrl: vi.fn(),
  };

  const userApiMock = {
    deleteUser: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [DeleteUser],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserApiService, useValue: userApiMock },
      ],
    }).compileComponents();
  });

  function createComponentWithUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    fixture = TestBed.createComponent(DeleteUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponentWithUser({ user_id: 'u-1', username: 'Alice' });
    expect(component).toBeTruthy();
  });

  it('should load userName and userId from localStorage on construction', () => {
    createComponentWithUser({ user_id: 'u-999', username: 'Alice' });

    expect(component.userId()).toBe('u-999');
    expect(component.userName()).toBe('Alice');
    expect(component.apiError()).toBe('');
  });

  it('should show "No user found in session" when localStorage has no user', () => {
    // no localStorage user set
    fixture = TestBed.createComponent(DeleteUser);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.apiError()).toBe('No user found in session');

    const alertEl = fixture.debugElement.query(By.css('.alert.alert-danger'));
    expect(alertEl).not.toBeNull();
    expect(alertEl.nativeElement.textContent).toContain('No user found in session');
  });

  it('should render the username in the confirmation message', () => {
    createComponentWithUser({ user_id: 'u-2', username: 'Ben' });

    const strongEl = fixture.debugElement.query(By.css('.delete-user__message strong'));
    expect(strongEl).not.toBeNull();
    expect(strongEl.nativeElement.textContent).toContain('"Ben"');
  });

  it('confirmDelete should call deleteUser with userId and navigate to /login on success', () => {
    createComponentWithUser({ user_id: 'u-123', username: 'Alice' });

    // Keep a key to verify localStorage.clear() happened
    localStorage.setItem('extra', 'value');

    userApiMock.deleteUser.mockReturnValue(of({}));

    component.confirmDelete();

    expect(component.isDeleting()).toBe(true);
    expect(userApiMock.deleteUser).toHaveBeenCalledTimes(1);
    expect(userApiMock.deleteUser).toHaveBeenCalledWith('u-123');

    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('extra')).toBeNull();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('confirmDelete should set apiError if no userId exists', () => {
    createComponentWithUser({ user_id: '', username: 'Alice' });

    component.confirmDelete();

    expect(userApiMock.deleteUser).not.toHaveBeenCalled();
    expect(component.apiError()).toBe('Cannot delete: No user ID found');
    expect(component.isDeleting()).toBe(false);

    fixture.detectChanges();
    const alertEl = fixture.debugElement.query(By.css('.alert.alert-danger'));
    expect(alertEl).not.toBeNull();
    expect(alertEl.nativeElement.textContent).toContain('Cannot delete: No user ID found');
  });

  it('confirmDelete should show failure message and reset isDeleting on error', () => {
    createComponentWithUser({ user_id: 'u-500', username: 'Alice' });

    userApiMock.deleteUser.mockReturnValue(
      throwError(() => new Error('boom'))
    );

    component.confirmDelete();

    expect(userApiMock.deleteUser).toHaveBeenCalledWith('u-500');
    expect(component.apiError()).toBe('Failed to delete profile. Please try again.');
    expect(component.isDeleting()).toBe(false);

    fixture.detectChanges();
    const alertEl = fixture.debugElement.query(By.css('.alert.alert-danger'));
    expect(alertEl).not.toBeNull();
    expect(alertEl.nativeElement.textContent).toContain('Failed to delete profile. Please try again.');
  });

  it('cancelDelete should navigate to /edit-user', () => {
    createComponentWithUser({ user_id: 'u-7', username: 'Alice' });

    component.cancelDelete();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/edit-user');
  });
});
