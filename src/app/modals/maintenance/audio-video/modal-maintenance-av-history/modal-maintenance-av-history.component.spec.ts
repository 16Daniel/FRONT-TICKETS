import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMaintenanceAvHistoryComponent } from './modal-maintenance-av-history.component';

describe('ModalMaintenanceAvHistoryComponent', () => {
  let component: ModalMaintenanceAvHistoryComponent;
  let fixture: ComponentFixture<ModalMaintenanceAvHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMaintenanceAvHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMaintenanceAvHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
