import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesAudioVideoTabComponent } from './branches-audio-video-tab.component';

describe('BranchesAudioVideoTabComponent', () => {
  let component: BranchesAudioVideoTabComponent;
  let fixture: ComponentFixture<BranchesAudioVideoTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesAudioVideoTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchesAudioVideoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
