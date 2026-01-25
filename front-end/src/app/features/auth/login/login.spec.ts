import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Login } from './login';
import { UserApiService } from '../../../services/user-api.service';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let router: Router;

  const userApiMock = {
    login: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: UserApiService, useValue: userApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(!!component).toBe(true);
  });

  it('should not call login endpoint when form is invalid, and should mark controls as touched', () => {
    component.form.setValue({ username: '', password: '' });

    component.onLogin();

    expect(component.form.get('username')?.touched === true).toBe(true);
    expect(component.form.get('password')?.touched === true).toBe(true);

    expect(userApiMock.login.mock.calls).toEqual([]);
  });

  it('should call login endpoint with correct DTO and navigate on success', () => {
    const navSpy = vi.spyOn(router, 'navigateByUrl');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    userApiMock.login.mockReturnValue(
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

    expect(userApiMock.login.mock.calls).toEqual([
      [{ username: 'alice', password: 'password' }],
    ]);

    expect(setItemSpy.mock.calls).toEqual([
      ['token', 'real-token'],
      [
        'user',
        JSON.stringify({
          user_id: '3',
          username: 'alice',
          email: 'alice@example.com',
          is_superuser: false,
        }),
      ],
    ]);

    expect(navSpy.mock.calls).toEqual([['/dashboard/main-page']]);
    expect(component.errorMessage).toBe('');
  });

  it('should set errorMessage and not navigate when login endpoint fails', () => {
    const navSpy = vi.spyOn(router, 'navigateByUrl');

    userApiMock.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );

    component.form.setValue({ username: 'alice', password: 'wrongpass' });

    component.onLogin();

    expect(userApiMock.login.mock.calls).toEqual([
      [{ username: 'alice', password: 'wrongpass' }],
    ]);

    expect(navSpy.mock.calls).toEqual([]);
    expect(component.errorMessage).toBe('Invalid credentials');
  });
});
