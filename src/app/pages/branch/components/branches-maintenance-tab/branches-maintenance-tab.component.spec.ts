import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesMaintenanceTabComponent } from './branches-maintenance-tab.component';

describe('BranchesMaintenanceTabComponent', () => {
  let component: BranchesMaintenanceTabComponent;
  let fixture: ComponentFixture<BranchesMaintenanceTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesMaintenanceTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchesMaintenanceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
