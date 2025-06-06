import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTicketsAccordionComponent } from './user-tickets-accordion.component';

describe('UserTicketsAccordionComponent', () => {
  let component: UserTicketsAccordionComponent;
  let fixture: ComponentFixture<UserTicketsAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTicketsAccordionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserTicketsAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
