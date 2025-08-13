import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBranchRatingComponent } from './modal-branch-rating.component';

describe('ModalBranchRatingComponent', () => {
  let component: ModalBranchRatingComponent;
  let fixture: ComponentFixture<ModalBranchRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBranchRatingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalBranchRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
