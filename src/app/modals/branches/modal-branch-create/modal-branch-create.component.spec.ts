import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBranchCreateComponent } from './modal-branch-create.component';

describe('ModalBranchCreateComponent', () => {
  let component: ModalBranchCreateComponent;
  let fixture: ComponentFixture<ModalBranchCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBranchCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalBranchCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
