import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalValidateTicketComponent } from './modal-validate-ticket.component';

describe('ModalValidateTicketComponent', () => {
  let component: ModalValidateTicketComponent;
  let fixture: ComponentFixture<ModalValidateTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalValidateTicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalValidateTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
