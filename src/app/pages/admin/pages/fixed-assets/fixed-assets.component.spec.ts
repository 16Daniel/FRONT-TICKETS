import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedAssetsComponent } from './fixed-assets.component';

describe('FixedAssetsComponent', () => {
  let component: FixedAssetsComponent;
  let fixture: ComponentFixture<FixedAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedAssetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixedAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
