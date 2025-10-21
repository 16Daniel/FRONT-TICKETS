import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionNuevoMensajeChatComponent } from './notificacion-nuevo-mensaje-chat.component';

describe('NotificacionNuevoMensajeChatComponent', () => {
  let component: NotificacionNuevoMensajeChatComponent;
  let fixture: ComponentFixture<NotificacionNuevoMensajeChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionNuevoMensajeChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificacionNuevoMensajeChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
