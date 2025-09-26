import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMaintenanceChatComponent } from './modal-maintenance-chat.component';

describe('ModalMaintenanceChatComponent', () => {
  let component: ModalMaintenanceChatComponent;
  let fixture: ComponentFixture<ModalMaintenanceChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMaintenanceChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMaintenanceChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
