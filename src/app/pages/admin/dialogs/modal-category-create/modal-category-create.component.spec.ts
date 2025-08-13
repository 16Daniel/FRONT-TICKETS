import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCategoryCreateComponent } from './modal-category-create.component';

describe('ModalCategoryCreateComponent', () => {
  let component: ModalCategoryCreateComponent;
  let fixture: ComponentFixture<ModalCategoryCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCategoryCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalCategoryCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
