import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFixedAssetMaintenanceComponent } from './modal-fixed-asset-maintenance.component';

describe('ModalFixedAssetMaintenanceComponent', () => {
  let component: ModalFixedAssetMaintenanceComponent;
  let fixture: ComponentFixture<ModalFixedAssetMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFixedAssetMaintenanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalFixedAssetMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
