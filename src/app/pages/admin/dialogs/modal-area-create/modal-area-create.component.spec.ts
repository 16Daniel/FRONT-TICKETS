import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAreaCreateComponent } from './modal-area-create.component';

describe('ModalAreaCreateComponent', () => {
  let component: ModalAreaCreateComponent;
  let fixture: ComponentFixture<ModalAreaCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAreaCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAreaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
