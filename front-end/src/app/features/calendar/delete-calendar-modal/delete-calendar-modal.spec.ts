import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { DeleteCalendarModal } from './delete-calendar-modal';

// Test wrapper component to set signal inputs
@Component({
  standalone: true,
  imports: [DeleteCalendarModal],
  template: `
    <app-delete-calendar-modal
      [targetId]="targetId()"
      [targetName]="targetName()"
      [isDeleting]="isDeleting()"
      [apiError]="apiError()"
      (cancel)="onCancel()"
      (confirmDelete)="onConfirmDelete($event)"
    />
  `,
})
class TestHostComponent {
  targetId = signal<string | null>(null);
  targetName = signal('Test Item');
  isDeleting = signal(false);
  apiError = signal('');

  cancelCalled = false;
  confirmDeleteCalledWith: string | null = null;

  onCancel() {
    this.cancelCalled = true;
  }

  onConfirmDelete(id: string) {
    this.confirmDeleteCalledWith = id;
  }
}

describe('DeleteCalendarModal', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;

    hostFixture.detectChanges();
    await hostFixture.whenStable();
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should emit cancel when onCancel is called', () => {
    const cancelBtn = hostFixture.nativeElement.querySelector('.btn-outline-secondary');
    cancelBtn.click();
    hostFixture.detectChanges();

    expect(hostComponent.cancelCalled).toBeTrue();
  });

  it('should emit confirmDelete with targetId when onConfirm is called', async () => {
    hostComponent.targetId.set('cg-123');
    hostComponent.isDeleting.set(false);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const confirmBtn = hostFixture.nativeElement.querySelector('.btn-danger');
    confirmBtn.click();
    hostFixture.detectChanges();

    expect(hostComponent.confirmDeleteCalledWith).toBe('cg-123');
  });

  it('should not emit confirmDelete if targetId is missing', async () => {
    hostComponent.targetId.set(null);
    hostComponent.isDeleting.set(false);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const confirmBtn = hostFixture.nativeElement.querySelector('.btn-danger');
    confirmBtn.click();
    hostFixture.detectChanges();

    expect(hostComponent.confirmDeleteCalledWith).toBeNull();
  });

  it('should not emit confirmDelete if isDeleting is true', async () => {
    hostComponent.targetId.set('cg-123');
    hostComponent.isDeleting.set(true);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const confirmBtn = hostFixture.nativeElement.querySelector('.btn-danger');
    confirmBtn.click();
    hostFixture.detectChanges();

    expect(hostComponent.confirmDeleteCalledWith).toBeNull();
  });
});