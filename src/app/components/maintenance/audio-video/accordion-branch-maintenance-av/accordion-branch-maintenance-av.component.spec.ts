import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionBranchMaintenanceAvComponent } from './accordion-branch-maintenance-av.component';

describe('AccordionBranchMaintenanceAvComponent', () => {
  let component: AccordionBranchMaintenanceAvComponent;
  let fixture: ComponentFixture<AccordionBranchMaintenanceAvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionBranchMaintenanceAvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccordionBranchMaintenanceAvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
