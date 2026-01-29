import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Login } from './login';
import { UserApiService } from '../../../shared/services/api/user-api.service';
import { NavigationService } from '../../../shared/services/navigation.service';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;

  const navigationMock = {
    goToHome: jasmine.createSpy('goToHome'),
  };

  const userApiMock = {
    login: jasmine.createSpy('login'),
  };

  beforeEach(async () => {
    localStorage.clear();
    navigationMock.goToHome.calls.reset();
    userApiMock.login.calls.reset();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: NavigationService, useValue: navigationMock },
        { provide: UserApiService, useValue: userApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call login endpoint when form is invalid, and should mark controls as touched', () => {
    component.form.setValue({ username: '', password: '' });

    component.onLogin();

    expect(component.form.invalid).toBe(true);
    expect(component.form.get('username')?.touched).toBe(true);
    expect(component.form.get('password')?.touched).toBe(true);

    expect(userApiMock.login).not.toHaveBeenCalled();
    expect(navigationMock.goToHome).not.toHaveBeenCalled();
  });

  it('should call login endpoint with correct DTO and navigate on success', () => {
    const setItemSpy = spyOn(Storage.prototype, 'setItem').and.callThrough();

    userApiMock.login.and.returnValue(
      of({
        token: 'real-token',
        user: {
          user_id: '3',
          username: 'alice',
          email: 'alice@example.com',
          is_superuser: false,
        },
        expires_at: '2026-02-01T00:00:00Z',
      })
    );

    component.form.setValue({ username: 'alice', password: 'password' });

    component.onLogin();

    expect(userApiMock.login).toHaveBeenCalledTimes(1);
    expect(userApiMock.login).toHaveBeenCalledWith({
      username: 'alice',
      password: 'password',
    });

    // component stores token, user, and expiresAt
    expect(setItemSpy).toHaveBeenCalledWith('token', 'real-token');
    expect(setItemSpy).toHaveBeenCalledWith(
      'user',
      JSON.stringify({
        user_id: '3',
        username: 'alice',
        email: 'alice@example.com',
        is_superuser: false,
      })
    );
    expect(setItemSpy).toHaveBeenCalledWith('expiresAt', '2026-02-01T00:00:00Z');

    expect(navigationMock.goToHome).toHaveBeenCalledTimes(1);
    expect(component.errorMessage()).toBe('');
  });

  it('should set errorMessage and not navigate when login endpoint fails (401/403 -> invalid username/password)', () => {
    userApiMock.login.and.returnValue(
      throwError(() => ({
        status: 401,
        error: { message: 'Invalid credentials' },
      }))
    );

    component.form.setValue({ username: 'alice', password: 'wrongpass' });

    component.onLogin();

    expect(userApiMock.login).toHaveBeenCalledTimes(1);
    expect(navigationMock.goToHome).not.toHaveBeenCalled();

    // per component logic for 401/403:
    expect(component.errorMessage()).toBe('Invalid username or password');
  });

  it('should set errorMessage using err.error.message for non-auth failures', () => {
    userApiMock.login.and.returnValue(
      throwError(() => ({
        status: 500,
        error: { message: 'Server blew up' },
      }))
    );

    component.form.setValue({ username: 'alice', password: 'password' });

    component.onLogin();

    expect(navigationMock.goToHome).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Server blew up');
  });
});
