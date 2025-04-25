import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchMaintenanceTableAvComponent } from './branch-maintenance-table-av.component';

describe('BranchMaintenanceTableAvComponent', () => {
  let component: BranchMaintenanceTableAvComponent;
  let fixture: ComponentFixture<BranchMaintenanceTableAvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchMaintenanceTableAvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchMaintenanceTableAvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
