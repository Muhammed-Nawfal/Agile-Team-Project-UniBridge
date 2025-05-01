import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityMatchRequestsComponent } from './activity-match-requests.component';

describe('ActivityMatchRequestsComponent', () => {
  let component: ActivityMatchRequestsComponent;
  let fixture: ComponentFixture<ActivityMatchRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityMatchRequestsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityMatchRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
