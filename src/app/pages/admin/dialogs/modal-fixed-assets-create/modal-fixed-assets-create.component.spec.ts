import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFixedAssetsCreateComponent } from './modal-fixed-assets-create.component';

describe('ModalFixedAssetsCreateComponent', () => {
  let component: ModalFixedAssetsCreateComponent;
  let fixture: ComponentFixture<ModalFixedAssetsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFixedAssetsCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalFixedAssetsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
