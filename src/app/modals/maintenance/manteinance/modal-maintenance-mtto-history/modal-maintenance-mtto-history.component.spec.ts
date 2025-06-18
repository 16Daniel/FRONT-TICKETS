import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMaintenanceMttoHistoryComponent } from './modal-maintenance-mtto-history.component';

describe('ModalMaintenanceMttoHistoryComponent', () => {
  let component: ModalMaintenanceMttoHistoryComponent;
  let fixture: ComponentFixture<ModalMaintenanceMttoHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMaintenanceMttoHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMaintenanceMttoHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
