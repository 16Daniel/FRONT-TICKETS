import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMaintenanceMttoImguploaderComponent } from './modal-maintenance-mtto-imguploader.component';

describe('ModalMaintenanceMttoImguploaderComponent', () => {
  let component: ModalMaintenanceMttoImguploaderComponent;
  let fixture: ComponentFixture<ModalMaintenanceMttoImguploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMaintenanceMttoImguploaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMaintenanceMttoImguploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
