import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Subject, throwError, of } from 'rxjs';

import { CreateAccount } from './create-account';
import { UserApiService } from '../../../shared/services/api/user-api.service';
import { NavigationService } from '../../../shared/services/navigation.service';

describe('CreateAccount', () => {
  let fixture: ComponentFixture<CreateAccount>;
  let component: CreateAccount;

  const navigationMock = {
    goToLogin: jasmine.createSpy('goToLogin'),
  };

  const userApiMock = {
    register: jasmine.createSpy('register'),
  };

  beforeEach(async () => {
    navigationMock.goToLogin.calls.reset();
    userApiMock.register.calls.reset();

    await TestBed.configureTestingModule({
      imports: [CreateAccount],
      providers: [
        { provide: NavigationService, useValue: navigationMock },
        { provide: UserApiService, useValue: userApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should block submission when form is invalid, show validation apiError, and not call register()', () => {
    userApiMock.register.and.returnValue(of({}));

    component.form.patchValue({ name: '', email: 'bad', password: '123' });
    component.createAccount();
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);
    expect(component.apiError()).toBe('Please fix validation errors.');
    expect(userApiMock.register).not.toHaveBeenCalled();

    const alert = fixture.nativeElement.querySelector('.alert.alert-danger');
    expect(!!alert).toBe(true);
  });

  it('should call UserApiService.register with correct DTO mapping (name -> username) and navigate on success', fakeAsync(() => {
    const subj = new Subject<any>();
    userApiMock.register.and.returnValue(subj.asObservable());

    component.form.patchValue({
      name: 'Alice C',
      email: 'alice@example.com',
      password: 'password123',
    });

    component.createAccount();

    expect(component.isSubmitting()).toBe(true);
    expect(component.apiError()).toBe('');
    expect(userApiMock.register).toHaveBeenCalledTimes(1);
    expect(userApiMock.register).toHaveBeenCalledWith({
      username: 'Alice C',
      email: 'alice@example.com',
      password: 'password123',
    });

    subj.next({ user_id: 'u1' });
    subj.complete();

    tick(); // allow finalize() + subscription handlers to run
    fixture.detectChanges();

    expect(component.isSubmitting()).toBe(false);
    expect(navigationMock.goToLogin).toHaveBeenCalledTimes(1);
  }));

  it('should handle API error response: show apiError, stop submitting, and not navigate', fakeAsync(() => {
    userApiMock.register.and.returnValue(
      throwError(() => ({ error: { message: 'Username already exists' } }))
    );

    component.form.patchValue({
      name: 'Alice C',
      email: 'alice@example.com',
      password: 'password123',
    });

    component.createAccount();

    tick();
    fixture.detectChanges();

    expect(component.isSubmitting()).toBe(false);
    expect(component.apiError()).toBe('Username already exists');
    expect(navigationMock.goToLogin).not.toHaveBeenCalled();

    const alert = fixture.nativeElement.querySelector('.alert.alert-danger');
    expect(!!alert).toBe(true);
  }));

  it('cancel() should navigate back to /login', () => {
    component.cancel();
    expect(navigationMock.goToLogin).toHaveBeenCalledTimes(1);
  });
});