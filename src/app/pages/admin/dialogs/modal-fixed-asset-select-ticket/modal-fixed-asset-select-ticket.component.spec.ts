import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFixedAssetSelectTicketComponent } from './modal-fixed-asset-select-ticket.component';

describe('ModalFixedAssetSelectTicketComponent', () => {
  let component: ModalFixedAssetSelectTicketComponent;
  let fixture: ComponentFixture<ModalFixedAssetSelectTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFixedAssetSelectTicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalFixedAssetSelectTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
