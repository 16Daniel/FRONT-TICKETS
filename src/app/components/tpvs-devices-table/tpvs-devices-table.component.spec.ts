import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpvsDevicesTableComponent } from './tpvs-devices-table.component';

describe('TpvsDevicesTableComponent', () => {
  let component: TpvsDevicesTableComponent;
  let fixture: ComponentFixture<TpvsDevicesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpvsDevicesTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TpvsDevicesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
