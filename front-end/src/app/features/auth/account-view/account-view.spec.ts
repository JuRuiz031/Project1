import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AccountView } from './account-view';

describe('AccountView', () => {
  let component: AccountView;
  let fixture: ComponentFixture<AccountView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountView],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountView);
    component = fixture.componentInstance;

    // ✅ IMPORTANT: render happens in YOUR tests, not here
    // (no fixture.detectChanges() in beforeEach)
  });

  it('should render name + email in disabled inputs', () => {
    component.user = {
      id: 'u-999',
      name: 'Ben Tuley',
      email: 'ben@example.com',
      role: 'User',
    };

    fixture.detectChanges(); // first render uses your values

    const inputs = fixture.debugElement.queryAll(By.css('input.form-control'));
    const nameInput: HTMLInputElement = inputs[0].nativeElement;
    const emailInput: HTMLInputElement = inputs[1].nativeElement;

    expect(nameInput.value).toBe('Ben Tuley');
    expect(emailInput.value).toBe('ben@example.com');
    expect(nameInput.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);
  });

  it('should show apiError only when apiError has a value', () => {
  // Case 1: apiError empty -> no alert in DOM
  let fixture = TestBed.createComponent(AccountView);
  let component = fixture.componentInstance;

  component.apiError = '';
  fixture.detectChanges();

  expect(fixture.debugElement.query(By.css('.alert.alert-danger'))).toBeNull();

  // Case 2: apiError set -> alert exists and shows text
  fixture = TestBed.createComponent(AccountView);
  component = fixture.componentInstance;

  component.apiError = 'Something went wrong';
  fixture.detectChanges();

  const alertEl = fixture.debugElement.query(By.css('.alert.alert-danger'));
  expect(alertEl).not.toBeNull();
  expect(alertEl.nativeElement.textContent).toContain('Something went wrong');
});
});
