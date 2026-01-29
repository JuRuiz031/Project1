import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MainHeader } from './main-header';

describe('MainHeader', () => {
  let component: MainHeader;
  let fixture: ComponentFixture<MainHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, // ✅ provides ActivatedRoute needed by RouterLink
        MainHeader,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});