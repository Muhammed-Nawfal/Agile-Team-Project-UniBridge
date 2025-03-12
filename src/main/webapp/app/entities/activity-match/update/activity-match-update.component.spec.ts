import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
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
  let profileService: ProfileService;
  let userService: UserService;
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
    profileService = TestBed.inject(ProfileService);
    userService = TestBed.inject(UserService);
    activityService = TestBed.inject(ActivityService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Profile query and add missing value', () => {
      const activityMatch: IActivityMatch = { id: 456 };
      const userName: IProfile = { id: 5249 };
      activityMatch.userName = userName;

      const profileCollection: IProfile[] = [{ id: 7332 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [userName];
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

    it('Should call User query and add missing value', () => {
      const activityMatch: IActivityMatch = { id: 456 };
      const requestUser: IUser = { id: 26310 };
      activityMatch.requestUser = requestUser;
      const matchedUser: IUser = { id: 18851 };
      activityMatch.matchedUser = matchedUser;

      const userCollection: IUser[] = [{ id: 16478 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [requestUser, matchedUser];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ activityMatch });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Activity query and add missing value', () => {
      const activityMatch: IActivityMatch = { id: 456 };
      const matchedActivity: IActivity = { id: 20204 };
      activityMatch.matchedActivity = matchedActivity;

      const activityCollection: IActivity[] = [{ id: 23860 }];
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
      const userName: IProfile = { id: 588 };
      activityMatch.userName = userName;
      const requestUser: IUser = { id: 17818 };
      activityMatch.requestUser = requestUser;
      const matchedUser: IUser = { id: 16230 };
      activityMatch.matchedUser = matchedUser;
      const matchedActivity: IActivity = { id: 5090 };
      activityMatch.matchedActivity = matchedActivity;

      activatedRoute.data = of({ activityMatch });
      comp.ngOnInit();

      expect(comp.profilesSharedCollection).toContain(userName);
      expect(comp.usersSharedCollection).toContain(requestUser);
      expect(comp.usersSharedCollection).toContain(matchedUser);
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
    describe('compareProfile', () => {
      it('Should forward to profileService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(profileService, 'compareProfile');
        comp.compareProfile(entity, entity2);
        expect(profileService.compareProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
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
