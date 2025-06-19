import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMateinanceMttoCheckComponent } from './modal-mateinance-mtto-check.component';

describe('ModalMateinanceMttoCheckComponent', () => {
  let component: ModalMateinanceMttoCheckComponent;
  let fixture: ComponentFixture<ModalMateinanceMttoCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMateinanceMttoCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMateinanceMttoCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
