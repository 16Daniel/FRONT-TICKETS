import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFilterTicketsComponent } from './modal-filter-tickets.component';

describe('ModalFilterTicketsComponent', () => {
  let component: ModalFilterTicketsComponent;
  let fixture: ComponentFixture<ModalFilterTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFilterTicketsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalFilterTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
