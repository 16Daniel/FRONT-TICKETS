import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenXtenMaintenanceCheckComponent } from './ten-xten-maintenance-check.component';

describe('TenXtenMaintenanceCheckComponent', () => {
  let component: TenXtenMaintenanceCheckComponent;
  let fixture: ComponentFixture<TenXtenMaintenanceCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenXtenMaintenanceCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TenXtenMaintenanceCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
