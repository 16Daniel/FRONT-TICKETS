import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPurshasesComponent } from './modal-purshases.component';

describe('ModalPurshasesComponent', () => {
  let component: ModalPurshasesComponent;
  let fixture: ComponentFixture<ModalPurshasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPurshasesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalPurshasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
