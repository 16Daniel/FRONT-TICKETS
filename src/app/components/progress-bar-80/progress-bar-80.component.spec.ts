import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBar80Component } from './progress-bar-80.component';

describe('ProgressBar80Component', () => {
  let component: ProgressBar80Component;
  let fixture: ComponentFixture<ProgressBar80Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBar80Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgressBar80Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
