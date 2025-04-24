import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IRanking } from 'app/entities/ranking/ranking.model';
import { RankingService } from 'app/entities/ranking/service/ranking.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IActivity } from 'app/entities/activity/activity.model';
import { ActivityService } from 'app/entities/activity/service/activity.service';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchService } from '../service/activity-match.service';
import { ActivityMatchFormService } from './activity-match-form.service';

import { ActivityMatchUpdateComponent } from './activity-match-update.component';

describe('ActivityMatch Management Update Component', () => {
  let comp: ActivityMatchUpdateComponent;
  let fixture: ComponentFixture<ActivityMatchUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let activityMatchFormService: ActivityMatchFormService;
  let activityMatchService: ActivityMatchService;
  let rankingService: RankingService;
  let profileService: ProfileService;
  let activityService: ActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActivityMatchUpdateComponent],
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
      .overrideTemplate(ActivityMatchUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ActivityMatchUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    activityMatchFormService = TestBed.inject(ActivityMatchFormService);
    activityMatchService = TestBed.inject(ActivityMatchService);
    rankingService = TestBed.inject(RankingService);
    profileService = TestBed.inject(ProfileService);
    activityService = TestBed.inject(ActivityService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call ratings query and add missing value', () => {
      const activityMatch: IActivityMatch = { id: 456 };
      const ratings: IRanking = { id: 11189 };
      activityMatch.ratings = ratings;

      const ratingsCollection: IRanking[] = [{ id: 7505 }];
      jest.spyOn(rankingService, 'query').mockReturnValue(of(new HttpResponse({ body: ratingsCollection })));
      const expectedCollection: IRanking[] = [ratings, ...ratingsCollection];
      jest.spyOn(rankingService, 'addRankingToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ activityMatch });
      comp.ngOnInit();

      expect(rankingService.query).toHaveBeenCalled();
      expect(rankingService.addRankingToCollectionIfMissing).toHaveBeenCalledWith(ratingsCollection, ratings);
      expect(comp.ratingsCollection).toEqual(expectedCollection);
    });

    it('Should call Profile query and add missing value', () => {
      const activityMatch: IActivityMatch = { id: 456 };
      const matchRequestor: IProfile = { id: 7823 };
      activityMatch.matchRequestor = matchRequestor;
      const userDetails: IProfile = { id: 24710 };
      activityMatch.userDetails = userDetails;

      const profileCollection: IProfile[] = [{ id: 27251 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [matchRequestor, userDetails];
      const expectedCollection: IProfile[] = [...additionalProfiles, ...profileCollection];
      jest.spyOn(profileService, 'addProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ activityMatch });
      comp.ngOnInit();

      expect(profileService.query).toHaveBeenCalled();
      expect(profileService.addProfileToCollectionIfMissing).toHaveBeenCalledWith(
        profileCollection,
        ...additionalProfiles.map(expect.objectContaining),
      );
      expect(comp.profilesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Activity query and add missing value', () => {
      const activityMatch: IActivityMatch = { id: 456 };
      const matchedActivity: IActivity = { id: 7267 };
      activityMatch.matchedActivity = matchedActivity;

      const activityCollection: IActivity[] = [{ id: 2244 }];
      jest.spyOn(activityService, 'query').mockReturnValue(of(new HttpResponse({ body: activityCollection })));
      const additionalActivities = [matchedActivity];
      const expectedCollection: IActivity[] = [...additionalActivities, ...activityCollection];
      jest.spyOn(activityService, 'addActivityToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ activityMatch });
      comp.ngOnInit();

      expect(activityService.query).toHaveBeenCalled();
      expect(activityService.addActivityToCollectionIfMissing).toHaveBeenCalledWith(
        activityCollection,
        ...additionalActivities.map(expect.objectContaining),
      );
      expect(comp.activitiesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const activityMatch: IActivityMatch = { id: 456 };
      const ratings: IRanking = { id: 3898 };
      activityMatch.ratings = ratings;
      const matchRequestor: IProfile = { id: 16953 };
      activityMatch.matchRequestor = matchRequestor;
      const userDetails: IProfile = { id: 14345 };
      activityMatch.userDetails = userDetails;
      const matchedActivity: IActivity = { id: 14876 };
      activityMatch.matchedActivity = matchedActivity;

      activatedRoute.data = of({ activityMatch });
      comp.ngOnInit();

      expect(comp.ratingsCollection).toContain(ratings);
      expect(comp.profilesSharedCollection).toContain(matchRequestor);
      expect(comp.profilesSharedCollection).toContain(userDetails);
      expect(comp.activitiesSharedCollection).toContain(matchedActivity);
      expect(comp.activityMatch).toEqual(activityMatch);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivityMatch>>();
      const activityMatch = { id: 123 };
      jest.spyOn(activityMatchFormService, 'getActivityMatch').mockReturnValue(activityMatch);
      jest.spyOn(activityMatchService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activityMatch });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: activityMatch }));
      saveSubject.complete();

      // THEN
      expect(activityMatchFormService.getActivityMatch).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(activityMatchService.update).toHaveBeenCalledWith(expect.objectContaining(activityMatch));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivityMatch>>();
      const activityMatch = { id: 123 };
      jest.spyOn(activityMatchFormService, 'getActivityMatch').mockReturnValue({ id: null });
      jest.spyOn(activityMatchService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activityMatch: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: activityMatch }));
      saveSubject.complete();

      // THEN
      expect(activityMatchFormService.getActivityMatch).toHaveBeenCalled();
      expect(activityMatchService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IActivityMatch>>();
      const activityMatch = { id: 123 };
      jest.spyOn(activityMatchService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ activityMatch });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(activityMatchService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareRanking', () => {
      it('Should forward to rankingService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(rankingService, 'compareRanking');
        comp.compareRanking(entity, entity2);
        expect(rankingService.compareRanking).toHaveBeenCalledWith(entity, entity2);
      });
    });

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
