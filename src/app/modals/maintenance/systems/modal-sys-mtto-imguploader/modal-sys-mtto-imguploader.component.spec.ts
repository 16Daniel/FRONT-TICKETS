import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSysMttoImguploaderComponent } from './modal-sys-mtto-imguploader.component';

describe('ModalSysMttoImguploaderComponent', () => {
  let component: ModalSysMttoImguploaderComponent;
  let fixture: ComponentFixture<ModalSysMttoImguploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSysMttoImguploaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalSysMttoImguploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
