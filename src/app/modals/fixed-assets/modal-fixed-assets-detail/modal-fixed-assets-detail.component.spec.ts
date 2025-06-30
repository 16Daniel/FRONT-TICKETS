import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFixedAssetsDetailComponent } from './modal-fixed-assets-detail.component';

describe('ModalFixedAssetsDetailComponent', () => {
  let component: ModalFixedAssetsDetailComponent;
  let fixture: ComponentFixture<ModalFixedAssetsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFixedAssetsDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalFixedAssetsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
