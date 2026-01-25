import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, throwError, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { CreateAccount } from './create-account';
import { UserApiService } from '../../../services/user-api.service';
import { Router } from '@angular/router';

describe('CreateAccount', () => {
  let fixture: ComponentFixture<CreateAccount>;
  let component: CreateAccount;

  const routerMock = {
    navigate: vi.fn(),
  };

  const userApiMock = {
    register: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CreateAccount],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserApiService, useValue: userApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(!!component).toBe(true);
  });

  it('should block submission when form is invalid, show validation apiError, and not call register()', () => {
    userApiMock.register.mockReturnValue(new Subject().asObservable());

    component.form.patchValue({ name: '', email: 'bad', password: '123' });
    component.createAccount();

    expect(component.form.invalid).toBe(true);
    expect(component.apiError.length > 0).toBe(true);
    expect(userApiMock.register).toHaveBeenCalledTimes(0);

    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('.alert.alert-danger');
    expect(!!alert).toBe(true);
  });

  it('should call UserApiService.register with correct DTO mapping (name -> username) and navigate on success', async () => {
    const subj = new Subject<any>();
    userApiMock.register.mockReturnValue(subj.asObservable());

    component.form.patchValue({
      name: 'Alice C',
      email: 'alice@example.com',
      password: 'password123',
    });

    component.createAccount();

    expect(component.isSubmitting).toBe(true);
    expect(userApiMock.register).toHaveBeenCalledTimes(1);
    expect(userApiMock.register).toHaveBeenCalledWith({
      username: 'Alice C',
      email: 'alice@example.com',
      password: 'password123',
    });

    // Resolve the observable without Zone helpers
    subj.next({ user_id: 1, username: 'Alice C', email: 'alice@example.com' });
    subj.complete();

    // let subscription finalize + change detection settle
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isSubmitting).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle API error response: show apiError, stop submitting, and not navigate', async () => {
    userApiMock.register.mockReturnValue(
      throwError(() => ({ error: { message: 'Username already exists' } }))
    );

    component.form.patchValue({
      name: 'Alice C',
      email: 'alice@example.com',
      password: 'password123',
    });

    component.createAccount();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isSubmitting).toBe(false);
    expect(component.apiError).toBe('Username already exists');
    expect(routerMock.navigate).toHaveBeenCalledTimes(0);

    const alert = fixture.nativeElement.querySelector('.alert.alert-danger');
    expect(!!alert).toBe(true);
  });

  it('cancel() should navigate back to /login', () => {
    component.cancel();
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
