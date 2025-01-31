import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGenerateTicketComponent } from './modal-generate-ticket.component';

describe('ModalGenerateTicketComponent', () => {
  let component: ModalGenerateTicketComponent;
  let fixture: ComponentFixture<ModalGenerateTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalGenerateTicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalGenerateTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
