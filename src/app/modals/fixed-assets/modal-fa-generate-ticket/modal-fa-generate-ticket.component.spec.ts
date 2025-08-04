import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFaGenerateTicketComponent } from './modal-fa-generate-ticket.component';

describe('ModalFaGenerateTicketComponent', () => {
  let component: ModalFaGenerateTicketComponent;
  let fixture: ComponentFixture<ModalFaGenerateTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFaGenerateTicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalFaGenerateTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
