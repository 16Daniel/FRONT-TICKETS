import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesTabsComponent } from './branches-tabs.component';

describe('BranchesTabsComponent', () => {
  let component: BranchesTabsComponent;
  let fixture: ComponentFixture<BranchesTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesTabsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchesTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
