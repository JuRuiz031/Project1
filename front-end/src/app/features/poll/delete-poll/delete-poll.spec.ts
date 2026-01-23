import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePoll } from './delete-poll';

describe('DeletePoll', () => {
  let component: DeletePoll;
  let fixture: ComponentFixture<DeletePoll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletePoll],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletePoll);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
