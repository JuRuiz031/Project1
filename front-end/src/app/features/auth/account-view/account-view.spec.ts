import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Router } from '@angular/router';

import { AccountView } from './account-view';
import { UserApiService } from '../../../shared/services/api/user-api.service';

describe('AccountView', () => {
  let fixture: ComponentFixture<AccountView>;
  let component: AccountView;

  const routerMock = {
    navigate: vi.fn(),
  };

  const userApiMock = {
    getUserById: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    // Ensure constructor loadUserData() finds a user_id in localStorage
    localStorage.setItem('user', JSON.stringify({ user_id: 'u-999' }));

    // Ensure API call resolves immediately and sets the signal
    userApiMock.getUserById.mockReturnValue(
      of({
        user_id: 'u-999',
        username: 'Ben Tuley',
        email: 'ben@example.com',
        role: 'User',
      })
    );

    await TestBed.configureTestingModule({
      imports: [AccountView],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserApiService, useValue: userApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountView);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call UserApiService.getUserById using the user_id from localStorage', () => {
    expect(userApiMock.getUserById).toHaveBeenCalledTimes(1);
    expect(userApiMock.getUserById).toHaveBeenCalledWith('u-999');
  });

  it('should render username + email in disabled inputs from user() signal', () => {
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input.form-control'));
    const nameInput: HTMLInputElement = inputs[0].nativeElement;
    const emailInput: HTMLInputElement = inputs[1].nativeElement;

    expect(nameInput.value).toBe('Ben Tuley');
    expect(emailInput.value).toBe('ben@example.com');
    expect(nameInput.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);
  });

  it('should show apiError only when apiError() has a value', () => {
    component.apiError.set('');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.alert.alert-danger'))).toBeNull();

    component.apiError.set('Something went wrong');
    fixture.detectChanges();

    const alertEl = fixture.debugElement.query(By.css('.alert.alert-danger'));
    expect(alertEl).not.toBeNull();
    expect(alertEl.nativeElement.textContent).toContain('Something went wrong');
  });

  it('goToDashboard should navigate to /dashboard/main-page', () => {
    component.goToDashboard();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/main-page']);
  });

  it('goToEditUser should navigate to /edit-user', () => {
    component.goToEditUser();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/edit-user']);
  });

  it('logOut should clear localStorage and navigate to /login', () => {
    localStorage.setItem('someKey', 'someValue');

    component.logOut();

    expect(localStorage.getItem('someKey')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
