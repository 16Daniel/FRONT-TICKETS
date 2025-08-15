import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAvMttoImguploaderComponent } from './modal-av-mtto-imguploader.component';

describe('ModalAvMttoImguploaderComponent', () => {
  let component: ModalAvMttoImguploaderComponent;
  let fixture: ComponentFixture<ModalAvMttoImguploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAvMttoImguploaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAvMttoImguploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
