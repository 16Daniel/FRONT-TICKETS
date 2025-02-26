import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionBranchMaintenance10x10Component } from './accordion-branch-maintenance10x10.component';

describe('AccordionBranchMaintenance10x10Component', () => {
  let component: AccordionBranchMaintenance10x10Component;
  let fixture: ComponentFixture<AccordionBranchMaintenance10x10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionBranchMaintenance10x10Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccordionBranchMaintenance10x10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
