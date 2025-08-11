import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVisorImagenesComponent } from './modal-visor-imagenes.component';

describe('ModalVisorImagenesComponent', () => {
  let component: ModalVisorImagenesComponent;
  let fixture: ComponentFixture<ModalVisorImagenesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalVisorImagenesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalVisorImagenesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
