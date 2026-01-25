import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { DeleteUser } from './delete-user';

class RouterStub {
  calls: string[] = [];
  navigateByUrl(url: string): Promise<boolean> | boolean {
    this.calls.push(url);
    return true;
  }
}

type InitState = Partial<Pick<DeleteUser, 'userName' | 'apiError' | 'isDeleting'>>;

async function create(init: InitState = {}): Promise<{
  fixture: ComponentFixture<DeleteUser>;
  component: DeleteUser;
  router: RouterStub;
}> {
  const router = new RouterStub();

  await TestBed.configureTestingModule({
    imports: [DeleteUser],
    providers: [{ provide: Router, useValue: router }],
  }).compileComponents();

  const fixture = TestBed.createComponent(DeleteUser);
  const component = fixture.componentInstance;

  // ✅ Set bound state BEFORE first render
  Object.assign(component, init);

  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, component, router };
}

describe('DeleteUser', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers(); // important: prevent timer leakage across tests
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    const { component } = await create();
    expect(component).toBeTruthy();
  });

  it('should render the page title and username', async () => {
    const { fixture } = await create({ userName: 'Alice' });

    const h1 = fixture.debugElement.query(By.css('h1'))?.nativeElement as HTMLElement;
    expect(h1?.textContent).toContain('Delete Profile');

    const message = fixture.debugElement.query(By.css('.delete-user__message'))?.nativeElement as HTMLElement;
    expect(message?.textContent).toContain('Alice');
    expect(message?.textContent).toContain('cannot be undone');
  });

  it('should NOT show the error alert when apiError is empty', async () => {
    const { fixture } = await create({ apiError: '' });

    const alert = fixture.debugElement.query(By.css('.alert.alert-danger'));
    expect(alert).toBeNull();
  });

  it('should show the error alert when apiError is set', async () => {
    const { fixture } = await create({ apiError: 'Something went wrong' });

    const alert = fixture.debugElement.query(By.css('.alert.alert-danger'))?.nativeElement as HTMLElement;
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Something went wrong');
  });

  it('cancelDelete() should navigate to /edit-user', async () => {
      const { component, router } = await create();

      component.cancelDelete();

      expect(router.calls).toContain('/edit-user');
    });

    it('confirmDelete() should set isDeleting, clear apiError, then navigate to /login after 400ms', async () => {
    vi.useFakeTimers();

    const { component, router } = await create({ apiError: 'Old error' });

    component.confirmDelete();

    // ✅ Assert state directly (no detectChanges here)
    expect(component.apiError).toBe('');
    expect(component.isDeleting).toBe(true);

    // ✅ No navigation yet
    expect(router.calls).not.toContain('/login');

    // ✅ Timer fires
    vi.advanceTimersByTime(400);

    // After timer callback
    expect(component.isDeleting).toBe(false);
    expect(router.calls).toContain('/login');
  });


  it('should disable the cancel button while deleting', async () => {
    const { fixture } = await create({ isDeleting: true });

    const cancelBtn = fixture.debugElement.query(
      By.css('button.btn.btn-outline-light')
    )?.nativeElement as HTMLButtonElement;

    expect(cancelBtn.disabled).toBe(true);
  });
});
