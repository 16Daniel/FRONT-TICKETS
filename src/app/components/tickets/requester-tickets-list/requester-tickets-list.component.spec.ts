import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterTicketsListComponent } from './requester-tickets-list.component';

describe('RequesterTicketsListComponent', () => {
  let component: RequesterTicketsListComponent;
  let fixture: ComponentFixture<RequesterTicketsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesterTicketsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequesterTicketsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
