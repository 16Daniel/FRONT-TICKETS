import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityTicketsAccordionComponent } from './priority-tickets-accordion.component';

describe('PriorityTicketsAccordionComponent', () => {
  let component: PriorityTicketsAccordionComponent;
  let fixture: ComponentFixture<PriorityTicketsAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriorityTicketsAccordionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PriorityTicketsAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
