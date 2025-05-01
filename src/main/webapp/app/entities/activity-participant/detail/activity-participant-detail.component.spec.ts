import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { ActivityParticipantDetailComponent } from './activity-participant-detail.component';

describe('ActivityParticipant Management Detail Component', () => {
  let comp: ActivityParticipantDetailComponent;
  let fixture: ComponentFixture<ActivityParticipantDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityParticipantDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./activity-participant-detail.component').then(m => m.ActivityParticipantDetailComponent),
              resolve: { activityParticipant: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(ActivityParticipantDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityParticipantDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load activityParticipant on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', ActivityParticipantDetailComponent);

      // THEN
      expect(instance.activityParticipant()).toEqual(expect.objectContaining({ id: 123 }));
    });
  });

  describe('PreviousState', () => {
    it('Should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
