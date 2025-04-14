import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTenXtenMaintenanceCheckComponent } from './modal-ten-xten-maintenance-check.component';

describe('TenXtenMaintenanceCheckComponent', () => {
  let component: ModalTenXtenMaintenanceCheckComponent;
  let fixture: ComponentFixture<ModalTenXtenMaintenanceCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTenXtenMaintenanceCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalTenXtenMaintenanceCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
