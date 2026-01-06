import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterExpenses } from './enter-expenses';

describe('EnterExpenses', () => {
  let component: EnterExpenses;
  let fixture: ComponentFixture<EnterExpenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterExpenses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterExpenses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
