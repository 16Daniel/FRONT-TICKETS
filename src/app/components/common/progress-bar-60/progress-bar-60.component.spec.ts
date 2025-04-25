import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBar60Component } from './progress-bar-60.component';

describe('ProgressBar60Component', () => {
  let component: ProgressBar60Component;
  let fixture: ComponentFixture<ProgressBar60Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBar60Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgressBar60Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
