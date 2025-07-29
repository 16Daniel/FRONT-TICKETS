import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFinalCommentsComponent } from './modal-final-comments.component';

describe('ModalFinalCommentsComponent', () => {
  let component: ModalFinalCommentsComponent;
  let fixture: ComponentFixture<ModalFinalCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFinalCommentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalFinalCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
