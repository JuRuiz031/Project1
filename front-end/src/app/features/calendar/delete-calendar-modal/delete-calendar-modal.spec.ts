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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cancel when onCancel is called', () => {
    const spy = vi.fn();
    component.cancel.subscribe(spy);

    component.onCancel();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit confirmDelete with targetId when onConfirm is called', () => {
    const spy = vi.fn();
    component.confirmDelete.subscribe(spy);

    component.targetId = 'cg-123';
    component.isDeleting = false;

    component.onConfirm();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('cg-123');
  });

  it('should not emit confirmDelete if targetId is missing', () => {
    const spy = vi.fn();
    component.confirmDelete.subscribe(spy);

    component.targetId = null;

    component.onConfirm();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should render nothing when isOpen is false', async () => {
    component.isOpen = false;
    fixture.detectChanges();
    await fixture.whenStable();

    const modalEl = fixture.nativeElement.querySelector('.app-modal');
    expect(modalEl).toBeNull();
  });

  it('should render modal when isOpen is true', async () => {
    component.isOpen = true;
    component.targetId = 'cg-123';
    component.targetName = 'Group A';
    fixture.detectChanges();
    await fixture.whenStable();

    const modalEl = fixture.nativeElement.querySelector('.app-modal');
    expect(modalEl).toBeTruthy();
  });
});