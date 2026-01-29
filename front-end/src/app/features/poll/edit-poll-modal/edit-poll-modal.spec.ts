import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPoll } from './edit-poll-modal';

describe('EditPoll', () => {
  let component: EditPoll;
  let fixture: ComponentFixture<EditPoll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPoll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPoll);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
