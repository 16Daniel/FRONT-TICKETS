import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMaintenanceTabComponent } from './admin-maintenance-tab.component';

describe('AdminMaintenanceTabComponent', () => {
  let component: AdminMaintenanceTabComponent;
  let fixture: ComponentFixture<AdminMaintenanceTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMaintenanceTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminMaintenanceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
