import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMaintenanceAvCheckComponent } from './modal-maintenance-av-check.component';

describe('ModalMaintenanceAvCheckComponent', () => {
  let component: ModalMaintenanceAvCheckComponent;
  let fixture: ComponentFixture<ModalMaintenanceAvCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMaintenanceAvCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMaintenanceAvCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
