import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTicketDetailComponent } from './modal-ticket-detail.component';

describe('ModalTicketDetailComponent', () => {
  let component: ModalTicketDetailComponent;
  let fixture: ComponentFixture<ModalTicketDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTicketDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalTicketDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
