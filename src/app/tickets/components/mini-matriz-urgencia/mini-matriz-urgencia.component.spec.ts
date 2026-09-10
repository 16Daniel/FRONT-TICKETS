import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniMatrizUrgenciaComponent } from './mini-matriz-urgencia.component';

describe('MiniMatrizUrgenciaComponent', () => {
  let component: MiniMatrizUrgenciaComponent;
  let fixture: ComponentFixture<MiniMatrizUrgenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniMatrizUrgenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiniMatrizUrgenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
