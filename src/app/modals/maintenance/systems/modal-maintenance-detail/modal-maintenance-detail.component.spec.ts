import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMaintenanceDetailComponent } from './modal-maintenance-detail.component';

describe('ModalMaintenanceDetailComponent', () => {
  let component: ModalMaintenanceDetailComponent;
  let fixture: ComponentFixture<ModalMaintenanceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMaintenanceDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMaintenanceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
