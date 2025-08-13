import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesTicketsAccordionComponent } from './branches-tickets-accordion.component';

describe('BranchesTicketsAccordionComponent', () => {
  let component: BranchesTicketsAccordionComponent;
  let fixture: ComponentFixture<BranchesTicketsAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesTicketsAccordionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchesTicketsAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
