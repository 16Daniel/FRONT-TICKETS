import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesSysTabComponent } from './branches-sys-tab.component';

describe('BranchesSysTabComponent', () => {
  let component: BranchesSysTabComponent;
  let fixture: ComponentFixture<BranchesSysTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesSysTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchesSysTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
