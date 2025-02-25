import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTicketsListComponent } from './admin-tickets-list.component';

describe('AdminTicketsListComponent', () => {
  let component: AdminTicketsListComponent;
  let fixture: ComponentFixture<AdminTicketsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTicketsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminTicketsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
