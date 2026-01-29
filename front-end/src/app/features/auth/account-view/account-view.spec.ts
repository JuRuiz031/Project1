import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AccountView } from './account-view';
import { UserApiService } from '../../../shared/services/api/user-api.service';
import { NavigationService } from '../../../shared/services/navigation.service';

describe('AccountView', () => {
  let fixture: ComponentFixture<AccountView>;
  let component: AccountView;

  const navigationMock = {
    goToHome: jasmine.createSpy('goToHome'),
    goToEditUser: jasmine.createSpy('goToEditUser'),
    goToLogin: jasmine.createSpy('goToLogin'),
  };

  const userApiMock = {
    getUserById: jasmine.createSpy('getUserById'),
  };

  beforeEach(async () => {
    localStorage.clear();

    navigationMock.goToHome.calls.reset();
    navigationMock.goToEditUser.calls.reset();
    navigationMock.goToLogin.calls.reset();
    userApiMock.getUserById.calls.reset();

    await TestBed.configureTestingModule({
      imports: [AccountView],
      providers: [
        { provide: NavigationService, useValue: navigationMock },
        { provide: UserApiService, useValue: userApiMock },
      ],
    }).compileComponents();
  });

  function createComponentWithSessionUser(sessionUser: any, fullUserResponse?: any) {
    localStorage.setItem('user', JSON.stringify(sessionUser));

    userApiMock.getUserById.and.returnValue(
      of(
        fullUserResponse ?? {
          user_id: sessionUser.user_id,
          username: sessionUser.username ?? 'Alice',
          email: sessionUser.email ?? 'alice@example.com',
          role: sessionUser.role ?? 'User',
        }
      )
    );

    fixture = TestBed.createComponent(AccountView);
    component = fixture.componentInstance;
    fixture.detectChanges(); // fine; constructor already ran, but this keeps template in sync
  }

  it('should create', () => {
    createComponentWithSessionUser({ user_id: 'u1', username: 'Alice' });
    expect(component).toBeTruthy();
  });

  it('should call UserApiService.getUserById using the user_id from localStorage', () => {
    createComponentWithSessionUser({ user_id: '123', username: 'Alice' });

    expect(userApiMock.getUserById).toHaveBeenCalledTimes(1);
    expect(userApiMock.getUserById).toHaveBeenCalledWith('123');
  });

  it('should populate user signal from API response', () => {
    createComponentWithSessionUser(
      { user_id: '123' },
      { user_id: '123', username: 'Ben', email: 'ben@test.com', role: 'Admin' }
    );

    expect(component.apiError()).toBe('');
    expect(component.user()).toEqual({
      id: '123',
      name: 'Ben',
      email: 'ben@test.com',
      role: 'Admin',
    });
  });

  it('should set apiError when no user exists in localStorage', () => {
    // no localStorage user set
    userApiMock.getUserById.and.returnValue(of({}));

    fixture = TestBed.createComponent(AccountView);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(userApiMock.getUserById).not.toHaveBeenCalled();
    expect(component.apiError()).toBe('No user found in session');
  });

  it('should set apiError when API call fails', () => {
    localStorage.setItem('user', JSON.stringify({ user_id: '123' }));
    userApiMock.getUserById.and.returnValue(throwError(() => new Error('boom')));

    fixture = TestBed.createComponent(AccountView);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(userApiMock.getUserById).toHaveBeenCalledTimes(1);
    expect(component.apiError()).toBe('Failed to load user details');
  });

  it('goToDashboard should navigate to home', () => {
    createComponentWithSessionUser({ user_id: '123' });

    component.goToDashboard();

    expect(navigationMock.goToHome).toHaveBeenCalledTimes(1);
  });

  it('goToEditUser should navigate to edit user', () => {
    createComponentWithSessionUser({ user_id: '123' });

    component.goToEditUser();

    expect(navigationMock.goToEditUser).toHaveBeenCalledTimes(1);
  });

  it('logOut should clear localStorage and navigate to login', () => {
    createComponentWithSessionUser({ user_id: '123' });

    localStorage.setItem('token', 't');
    localStorage.setItem('expiresAt', 'x');

    component.logOut();

    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('expiresAt')).toBeNull();

    expect(navigationMock.goToLogin).toHaveBeenCalledTimes(1);
  });
});