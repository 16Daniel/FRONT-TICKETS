import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRequestPurchaseComponent } from './modal-request-purchase.component';

describe('ModalRequestPurchaseComponent', () => {
  let component: ModalRequestPurchaseComponent;
  let fixture: ComponentFixture<ModalRequestPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRequestPurchaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalRequestPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
