import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistHomeComponent } from './specialist-home.component';

describe('SpecialistHomeComponent', () => {
  let component: SpecialistHomeComponent;
  let fixture: ComponentFixture<SpecialistHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpecialistHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
