import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUserCreateComponent } from './modal-user-create.component';

describe('ModalUserCreateComponent', () => {
  let component: ModalUserCreateComponent;
  let fixture: ComponentFixture<ModalUserCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalUserCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalUserCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
