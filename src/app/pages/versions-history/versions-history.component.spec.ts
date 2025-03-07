import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionsHistoryComponent } from './versions-history.component';

describe('VersionsHistoryComponent', () => {
  let component: VersionsHistoryComponent;
  let fixture: ComponentFixture<VersionsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VersionsHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VersionsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
