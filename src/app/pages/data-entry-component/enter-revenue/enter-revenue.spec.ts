import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterRevenue } from './enter-revenue';

describe('EnterRevenue', () => {
  let component: EnterRevenue;
  let fixture: ComponentFixture<EnterRevenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterRevenue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterRevenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
