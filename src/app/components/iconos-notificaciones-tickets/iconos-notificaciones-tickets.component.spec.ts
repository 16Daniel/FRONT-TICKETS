import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconosNotificacionesTicketsComponent } from './iconos-notificaciones-tickets.component';

describe('IconosNotificacionesTicketsComponent', () => {
  let component: IconosNotificacionesTicketsComponent;
  let fixture: ComponentFixture<IconosNotificacionesTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconosNotificacionesTicketsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IconosNotificacionesTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
