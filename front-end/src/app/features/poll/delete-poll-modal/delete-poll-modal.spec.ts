import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeletePollModal } from './delete-poll-modal';

describe('DeletePollModal', () => {
  let component: DeletePollModal;
  let fixture: ComponentFixture<DeletePollModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletePollModal],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletePollModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
