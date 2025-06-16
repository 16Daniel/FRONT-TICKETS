import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMateinanceMttoHistoryComponent } from './modal-mateinance-mtto-history.component';

describe('ModalMateinanceMttoHistoryComponent', () => {
  let component: ModalMateinanceMttoHistoryComponent;
  let fixture: ComponentFixture<ModalMateinanceMttoHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMateinanceMttoHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMateinanceMttoHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
