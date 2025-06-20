import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionBranchMaintenanceMttoComponent } from './accordion-branch-maintenance-mtto.component';

describe('AccordionBranchMaintenanceMttoComponent', () => {
  let component: AccordionBranchMaintenanceMttoComponent;
  let fixture: ComponentFixture<AccordionBranchMaintenanceMttoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionBranchMaintenanceMttoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccordionBranchMaintenanceMttoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
