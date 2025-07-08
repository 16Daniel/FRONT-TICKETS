import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFixedAssetTicketsComponent } from './modal-fixed-asset-tickets.component';

describe('ModalFixedAssetTicketsComponent', () => {
  let component: ModalFixedAssetTicketsComponent;
  let fixture: ComponentFixture<ModalFixedAssetTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFixedAssetTicketsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalFixedAssetTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
