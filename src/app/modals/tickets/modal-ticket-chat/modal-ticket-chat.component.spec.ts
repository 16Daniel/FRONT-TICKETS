import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTicketChatComponent } from './modal-ticket-chat.component';

describe('ModalTicketChatComponent', () => {
  let component: ModalTicketChatComponent;
  let fixture: ComponentFixture<ModalTicketChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTicketChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalTicketChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
