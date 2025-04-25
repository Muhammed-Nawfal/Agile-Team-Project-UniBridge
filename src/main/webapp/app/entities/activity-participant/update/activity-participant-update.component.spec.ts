import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IActivity } from 'app/entities/activity/activity.model';
import { ActivityService } from 'app/entities/activity/service/activity.service';
import { IActivityParticipant } from '../activity-participant.model';
import { ActivityParticipantService } from '../service/activity-participant.service';
import { ActivityParticipantFormService } from './activity-participant-form.service';

import { ActivityParticipantUpdateComponent } from './activity-participant-update.component';

describe('ActivityParticipant Management Update Component', () => {
  let comp: ActivityParticipantUpdateComponent;
  let fixture: ComponentFixture<ActivityParticipantUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let activityParticipantFormService: ActivityParticipantFormService;
  let activityParticipantService: ActivityParticipantService;
  let profileService: ProfileService;
  let activityService: ActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActivityParticipantUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(ActivityParticipantUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ActivityParticipantUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    activityParticipantFormService = TestBed.inject(ActivityParticipantFormService);
    activityParticipantService = TestBed.inject(ActivityParticipantService);
    profileService = TestBed.inject(ProfileService);
    activityService = TestBed.inject(ActivityService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Profile query and add missing value', () => {
      const activityParticipant: IActivityParticipant = { id: 456 };
      const participant: IProfile = { id: 8009 };
      activityParticipant.participant = participant;

      const profileCollection: IProfile[] = [{ id: 31549 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [participant];
      const expectedCollection: IProfile[] = [...additionalProfiles, ...profileCollection];
      jest.spyOn(profileService, 'addProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ activityParticipant });
      comp.ngOnInit();

      expect(profileService.query).toHaveBeenCalled();
      expect(profileService.addProfileToCollectionIfMissing).toHaveBeenCalledWith(
        profileCollection,
        ...additionalProfiles.map(expect.objectContaining),
      );
      expect(comp.profilesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Activity query and add missing value', () => {
      const activityParticipant: IActivityParticipant = { id: 456 };
      const activity: IActivity = { id: 22401 };
      activityParticipant.activity = activity;

      const activityCollection: IActivity[] = [{ id: 26800 }];
      jest.spyOn(activityService, 'query').mockReturnValue(of(new HttpResponse({ body: activityCollection })));
      const additionalActivities = [activity];
      const expectedCollection: IActivity[] = [...additionalActivities, ...activityCollection];
      jest.spyOn(activityService, 'addActivityToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ activityParticipant });
      comp.ngOnInit();

      expect(activityService.query).toHaveBeenCalled();
      expect(activityService.addActivityToCollectionIfMissing).toHaveBeenCalledWith(
        activityCollection,
        ...additionalActivities.map(expect.objectContaining),
      );
      expect(comp.activitiesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const activityParticipant: IActivityParticipant = { id: 456 };
      const participant: IProfile = { id: 13778 };
      activityParticipant.participant = participant;
      const activity: IActivity = { id: 19732 };
      activityParticipant.activity = activity;

      activatedRoute.data = of({ activityParticipant });
      comp.ngOnInit();

      expect(comp.profilesSharedCollection).toContain(participant);
      expect(comp.activitiesSharedCollection).toContain(activity);
      expect(comp.activityParticipant).toEqual(activityParticipant);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivityParticipant>>();
      const activityParticipant = { id: 123 };
      jest.spyOn(activityParticipantFormService, 'getActivityParticipant').mockReturnValue(activityParticipant);
      jest.spyOn(activityParticipantService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activityParticipant });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: activityParticipant }));
      saveSubject.complete();

      // THEN
      expect(activityParticipantFormService.getActivityParticipant).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(activityParticipantService.update).toHaveBeenCalledWith(expect.objectContaining(activityParticipant));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivityParticipant>>();
      const activityParticipant = { id: 123 };
      jest.spyOn(activityParticipantFormService, 'getActivityParticipant').mockReturnValue({ id: null });
      jest.spyOn(activityParticipantService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activityParticipant: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: activityParticipant }));
      saveSubject.complete();

      // THEN
      expect(activityParticipantFormService.getActivityParticipant).toHaveBeenCalled();
      expect(activityParticipantService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivityParticipant>>();
      const activityParticipant = { id: 123 };
      jest.spyOn(activityParticipantService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activityParticipant });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(activityParticipantService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareProfile', () => {
      it('Should forward to profileService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(profileService, 'compareProfile');
        comp.compareProfile(entity, entity2);
        expect(profileService.compareProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareActivity', () => {
      it('Should forward to activityService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(activityService, 'compareActivity');
        comp.compareActivity(entity, entity2);
        expect(activityService.compareActivity).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
