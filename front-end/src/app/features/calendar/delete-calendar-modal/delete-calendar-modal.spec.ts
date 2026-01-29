import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteCalendarModal } from './delete-calendar-modal';

describe('DeleteCalendarModal', () => {
  let component: DeleteCalendarModal;
  let fixture: ComponentFixture<DeleteCalendarModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteCalendarModal],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteCalendarModal);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cancel when onCancel is called', () => {
    const cancelSpy = jasmine.createSpy('cancelSpy');
    component.cancel.subscribe(cancelSpy);

    component.onCancel();

    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit confirmDelete with targetId when onConfirm is called', () => {
    const confirmSpy = jasmine.createSpy('confirmSpy');
    component.confirmDelete.subscribe(confirmSpy);

    component.targetId = 'cg-123';
    component.isDeleting = false;

    component.onConfirm();

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(confirmSpy).toHaveBeenCalledWith('cg-123');
  });

  it('should not emit confirmDelete if targetId is missing', () => {
    const confirmSpy = jasmine.createSpy('confirmSpy');
    component.confirmDelete.subscribe(confirmSpy);

    component.targetId = null;
    component.isDeleting = false;

    component.onConfirm();

    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('should not emit confirmDelete if isDeleting is true', () => {
    const confirmSpy = jasmine.createSpy('confirmSpy');
    component.confirmDelete.subscribe(confirmSpy);

    component.targetId = 'cg-123';
    component.isDeleting = true;

    component.onConfirm();

    expect(confirmSpy).not.toHaveBeenCalled();
  });
});