import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchVisitItemComponent } from './branch-visit-item.component';

describe('BranchVisitItemComponent', () => {
  let component: BranchVisitItemComponent;
  let fixture: ComponentFixture<BranchVisitItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchVisitItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchVisitItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
