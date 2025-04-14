import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTenXtenMaintenanceHistoryComponent } from './modal-ten-xten-maintenance-history.component';

describe('ModalTenXtenMaintenanceHistoryComponent', () => {
  let component: ModalTenXtenMaintenanceHistoryComponent;
  let fixture: ComponentFixture<ModalTenXtenMaintenanceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTenXtenMaintenanceHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalTenXtenMaintenanceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
