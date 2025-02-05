import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFinalizeTicketComponent } from './modal-finalize-ticket.component';

describe('ModalFinalizeTicketComponent', () => {
  let component: ModalFinalizeTicketComponent;
  let fixture: ComponentFixture<ModalFinalizeTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFinalizeTicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalFinalizeTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
