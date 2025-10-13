import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalColorEstatusDispositivoTpvComponent } from './modal-color-estatus-dispositivo-tpv.component';

describe('ModalColorEstatusDispositivoTpvComponent', () => {
  let component: ModalColorEstatusDispositivoTpvComponent;
  let fixture: ComponentFixture<ModalColorEstatusDispositivoTpvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalColorEstatusDispositivoTpvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalColorEstatusDispositivoTpvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
