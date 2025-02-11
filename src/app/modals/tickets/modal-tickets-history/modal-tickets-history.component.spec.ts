import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTicketsHistoryComponent } from './modal-tickets-history.component';

describe('ModalTicketsHistoryComponent', () => {
  let component: ModalTicketsHistoryComponent;
  let fixture: ComponentFixture<ModalTicketsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTicketsHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalTicketsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
