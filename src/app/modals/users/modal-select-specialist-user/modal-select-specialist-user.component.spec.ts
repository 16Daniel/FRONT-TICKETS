import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSelectSpecialistUserComponent } from './modal-select-specialist-user.component';

describe('ModalSelectSpecialistUserComponent', () => {
  let component: ModalSelectSpecialistUserComponent;
  let fixture: ComponentFixture<ModalSelectSpecialistUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSelectSpecialistUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalSelectSpecialistUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
