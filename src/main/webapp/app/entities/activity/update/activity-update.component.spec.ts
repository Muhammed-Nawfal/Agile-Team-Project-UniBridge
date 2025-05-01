import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IChallenge } from 'app/entities/challenge/challenge.model';
import { ChallengeService } from 'app/entities/challenge/service/challenge.service';
import { IActivity } from '../activity.model';
import { ActivityService } from '../service/activity.service';
import { ActivityFormService } from './activity-form.service';

import { ActivityUpdateComponent } from './activity-update.component';

describe('Activity Management Update Component', () => {
  let comp: ActivityUpdateComponent;
  let fixture: ComponentFixture<ActivityUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let activityFormService: ActivityFormService;
  let activityService: ActivityService;
  let profileService: ProfileService;
  let challengeService: ChallengeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActivityUpdateComponent],
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
      .overrideTemplate(ActivityUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ActivityUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    activityFormService = TestBed.inject(ActivityFormService);
    activityService = TestBed.inject(ActivityService);
    profileService = TestBed.inject(ProfileService);
    challengeService = TestBed.inject(ChallengeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Profile query and add missing value', () => {
      const activity: IActivity = { id: 456 };
      const creator: IProfile = { id: 28464 };
      activity.creator = creator;

      const profileCollection: IProfile[] = [{ id: 9126 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [creator];
      const expectedCollection: IProfile[] = [...additionalProfiles, ...profileCollection];
      jest.spyOn(profileService, 'addProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ activity });
      comp.ngOnInit();

      expect(profileService.query).toHaveBeenCalled();
      expect(profileService.addProfileToCollectionIfMissing).toHaveBeenCalledWith(
        profileCollection,
        ...additionalProfiles.map(expect.objectContaining),
      );
      expect(comp.profilesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Challenge query and add missing value', () => {
      const activity: IActivity = { id: 456 };
      const challenge: IChallenge = { id: 13616 };
      activity.challenge = challenge;

      const challengeCollection: IChallenge[] = [{ id: 17610 }];
      jest.spyOn(challengeService, 'query').mockReturnValue(of(new HttpResponse({ body: challengeCollection })));
      const additionalChallenges = [challenge];
      const expectedCollection: IChallenge[] = [...additionalChallenges, ...challengeCollection];
      jest.spyOn(challengeService, 'addChallengeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ activity });
      comp.ngOnInit();

      expect(challengeService.query).toHaveBeenCalled();
      expect(challengeService.addChallengeToCollectionIfMissing).toHaveBeenCalledWith(
        challengeCollection,
        ...additionalChallenges.map(expect.objectContaining),
      );
      expect(comp.challengesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const activity: IActivity = { id: 456 };
      const creator: IProfile = { id: 22404 };
      activity.creator = creator;
      const challenge: IChallenge = { id: 5002 };
      activity.challenge = challenge;

      activatedRoute.data = of({ activity });
      comp.ngOnInit();

      expect(comp.profilesSharedCollection).toContain(creator);
      expect(comp.challengesSharedCollection).toContain(challenge);
      expect(comp.activity).toEqual(activity);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivity>>();
      const activity = { id: 123 };
      jest.spyOn(activityFormService, 'getActivity').mockReturnValue(activity);
      jest.spyOn(activityService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activity });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: activity }));
      saveSubject.complete();

      // THEN
      expect(activityFormService.getActivity).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(activityService.update).toHaveBeenCalledWith(expect.objectContaining(activity));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivity>>();
      const activity = { id: 123 };
      jest.spyOn(activityFormService, 'getActivity').mockReturnValue({ id: null });
      jest.spyOn(activityService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activity: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: activity }));
      saveSubject.complete();

      // THEN
      expect(activityFormService.getActivity).toHaveBeenCalled();
      expect(activityService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivity>>();
      const activity = { id: 123 };
      jest.spyOn(activityService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activity });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(activityService.update).toHaveBeenCalled();
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

    describe('compareChallenge', () => {
      it('Should forward to challengeService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(challengeService, 'compareChallenge');
        comp.compareChallenge(entity, entity2);
        expect(challengeService.compareChallenge).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
