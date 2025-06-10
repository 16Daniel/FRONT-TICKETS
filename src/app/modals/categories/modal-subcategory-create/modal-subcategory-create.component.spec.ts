import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSubcategoryCreateComponent } from './modal-subcategory-create.component';

describe('ModalSubcategoryCreateComponent', () => {
  let component: ModalSubcategoryCreateComponent;
  let fixture: ComponentFixture<ModalSubcategoryCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSubcategoryCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalSubcategoryCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
