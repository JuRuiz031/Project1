import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { Login } from './login';
import { UserApiService } from '../../../shared/services/api/user-api.service';
import { NavigationService } from '../../../shared/services/navigation.service';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;

  let userApiMock: jasmine.SpyObj<UserApiService>;
  let navigationMock: jasmine.SpyObj<NavigationService>;

  beforeEach(() => {
    localStorage.clear();

    userApiMock = jasmine.createSpyObj<UserApiService>('UserApiService', ['login']);
    navigationMock = jasmine.createSpyObj<NavigationService>('NavigationService', ['goToHome']);

    TestBed.configureTestingModule({
      imports: [
        Login,
        RouterTestingModule.withRoutes([]), // ✅ provides Router + ActivatedRoute for routerLink
      ],
      providers: [
        { provide: UserApiService, useValue: userApiMock },
        { provide: NavigationService, useValue: navigationMock },
      ],
    });

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call login endpoint when form is invalid, and should mark controls as touched', () => {
    const touchedSpy = spyOn(component.form, 'markAllAsTouched').and.callThrough();

    component.form.patchValue({ username: '', password: '' }); // invalid
    component.onLogin();

    expect(userApiMock.login).not.toHaveBeenCalled();
    expect(touchedSpy).toHaveBeenCalled();
  });

  it('should call login endpoint with correct DTO and navigate on success', () => {
    userApiMock.login.and.returnValue(of({
      token: 't123',
      user: { user_id: 1, username: 'alice' },
      expires_at: '2099-01-01T00:00:00Z',
    } as any));

    component.form.setValue({ username: 'alice', password: 'password' });
    component.onLogin();

    expect(userApiMock.login).toHaveBeenCalledWith({ username: 'alice', password: 'password' });
    expect(localStorage.getItem('token')).toBe('t123');
    expect(localStorage.getItem('expiresAt')).toBe('2099-01-01T00:00:00Z');
    expect(navigationMock.goToHome).toHaveBeenCalled();
  });

  it('should set errorMessage and not navigate when login endpoint fails (401/403 -> invalid username/password)', () => {
    userApiMock.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.form.setValue({ username: 'alice', password: 'password' });
    component.onLogin();

    expect(navigationMock.goToHome).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Invalid username or password');
  });

  it('should set errorMessage using err.error.message for non-auth failures', () => {
    userApiMock.login.and.returnValue(throwError(() => ({
      status: 500,
      error: { message: 'Server blew up' },
    })));

    component.form.setValue({ username: 'alice', password: 'password' });
    component.onLogin();

    expect(navigationMock.goToHome).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Server blew up');
  });
});