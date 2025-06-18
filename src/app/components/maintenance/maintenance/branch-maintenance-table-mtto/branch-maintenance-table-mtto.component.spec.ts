import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchMaintenanceTableMttoComponent } from './branch-maintenance-table-mtto.component';

describe('BranchMaintenanceTableMttoComponent', () => {
  let component: BranchMaintenanceTableMttoComponent;
  let fixture: ComponentFixture<BranchMaintenanceTableMttoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchMaintenanceTableMttoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchMaintenanceTableMttoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
