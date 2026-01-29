import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, throwError, of } from 'rxjs';

import { CreateAccount } from './create-account';
import { UserApiService } from '../../../shared/services/api/user-api.service';
import { NavigationService } from '../../../shared/services/navigation.service';

describe('CreateAccount', () => {
  let fixture: ComponentFixture<CreateAccount>;
  let component: CreateAccount;

  let navigationMock: jasmine.SpyObj<NavigationService>;
  let userApiMock: jasmine.SpyObj<UserApiService>;

  beforeEach(async () => {
    navigationMock = jasmine.createSpyObj<NavigationService>('NavigationService', ['goToLogin']);
    userApiMock = jasmine.createSpyObj<UserApiService>('UserApiService', ['register']);

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
    component.form.patchValue({ name: '', email: 'bad', password: '123' }); // invalid (name required, email invalid, pw too short)
    component.createAccount();
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);
    expect(component.apiError()).toBe('Please fix validation errors.');
    expect(userApiMock.register).not.toHaveBeenCalled();

    const alert = fixture.nativeElement.querySelector('.alert.alert-danger');
    expect(alert).toBeTruthy();
  });

  it('should call UserApiService.register with correct DTO mapping (name -> username) and navigate on success', () => {
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
    fixture.detectChanges();

    expect(component.isSubmitting()).toBe(false);
    expect(navigationMock.goToLogin).toHaveBeenCalledTimes(1);
  });

  it('should handle API error response: show apiError, stop submitting, and not navigate', () => {
    userApiMock.register.and.returnValue(
      throwError(() => ({ error: { message: 'Username already exists' } }))
    );

    component.form.patchValue({
      name: 'Alice C',
      email: 'alice@example.com',
      password: 'password123',
    });

    component.createAccount();
    fixture.detectChanges();

    // throwError emits synchronously; finalize runs synchronously too
    expect(component.isSubmitting()).toBe(false);
    expect(component.apiError()).toBe('Username already exists');
    expect(navigationMock.goToLogin).not.toHaveBeenCalled();

    const alert = fixture.nativeElement.querySelector('.alert.alert-danger');
    expect(alert).toBeTruthy();
  });

  it('cancel() should navigate back to /login', () => {
    component.cancel();
    expect(navigationMock.goToLogin).toHaveBeenCalledTimes(1);
  });
});