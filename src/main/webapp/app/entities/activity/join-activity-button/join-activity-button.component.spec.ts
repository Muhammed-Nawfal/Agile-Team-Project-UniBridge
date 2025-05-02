import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinActivityButtonComponent } from './join-activity-button.component';

describe('JoinActivityButtonComponent', () => {
  let component: JoinActivityButtonComponent;
  let fixture: ComponentFixture<JoinActivityButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinActivityButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinActivityButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
