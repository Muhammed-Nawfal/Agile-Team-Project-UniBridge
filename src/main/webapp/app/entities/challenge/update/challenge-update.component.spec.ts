import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IFriendsList } from 'app/entities/friends-list/friends-list.model';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';
import { IActivity } from 'app/entities/activity/activity.model';
import { ActivityService } from 'app/entities/activity/service/activity.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IChallenge } from '../challenge.model';
import { ChallengeService } from '../service/challenge.service';
import { ChallengeFormService } from './challenge-form.service';

import { ChallengeUpdateComponent } from './challenge-update.component';

describe('Challenge Management Update Component', () => {
  let comp: ChallengeUpdateComponent;
  let fixture: ComponentFixture<ChallengeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let challengeFormService: ChallengeFormService;
  let challengeService: ChallengeService;
  let profileService: ProfileService;
  let friendsListService: FriendsListService;
  let activityService: ActivityService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChallengeUpdateComponent],
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
      .overrideTemplate(ChallengeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ChallengeUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    challengeFormService = TestBed.inject(ChallengeFormService);
    challengeService = TestBed.inject(ChallengeService);
    profileService = TestBed.inject(ProfileService);
    friendsListService = TestBed.inject(FriendsListService);
    activityService = TestBed.inject(ActivityService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Profile query and add missing value', () => {
      const challenge: IChallenge = { id: 456 };
      const challenges: IProfile = { id: 8285 };
      challenge.challenges = challenges;

      const profileCollection: IProfile[] = [{ id: 4099 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [challenges];
      const expectedCollection: IProfile[] = [...additionalProfiles, ...profileCollection];
      jest.spyOn(profileService, 'addProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ challenge });
      comp.ngOnInit();

      expect(profileService.query).toHaveBeenCalled();
      expect(profileService.addProfileToCollectionIfMissing).toHaveBeenCalledWith(
        profileCollection,
        ...additionalProfiles.map(expect.objectContaining),
      );
      expect(comp.profilesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call FriendsList query and add missing value', () => {
      const challenge: IChallenge = { id: 456 };
      const challengedFriend: IFriendsList = { id: 16511 };
      challenge.challengedFriend = challengedFriend;

      const friendsListCollection: IFriendsList[] = [{ id: 26937 }];
      jest.spyOn(friendsListService, 'query').mockReturnValue(of(new HttpResponse({ body: friendsListCollection })));
      const additionalFriendsLists = [challengedFriend];
      const expectedCollection: IFriendsList[] = [...additionalFriendsLists, ...friendsListCollection];
      jest.spyOn(friendsListService, 'addFriendsListToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ challenge });
      comp.ngOnInit();

      expect(friendsListService.query).toHaveBeenCalled();
      expect(friendsListService.addFriendsListToCollectionIfMissing).toHaveBeenCalledWith(
        friendsListCollection,
        ...additionalFriendsLists.map(expect.objectContaining),
      );
      expect(comp.friendsListsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Activity query and add missing value', () => {
      const challenge: IChallenge = { id: 456 };
      const challengedActivity: IActivity = { id: 13942 };
      challenge.challengedActivity = challengedActivity;

      const activityCollection: IActivity[] = [{ id: 105 }];
      jest.spyOn(activityService, 'query').mockReturnValue(of(new HttpResponse({ body: activityCollection })));
      const additionalActivities = [challengedActivity];
      const expectedCollection: IActivity[] = [...additionalActivities, ...activityCollection];
      jest.spyOn(activityService, 'addActivityToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ challenge });
      comp.ngOnInit();

      expect(activityService.query).toHaveBeenCalled();
      expect(activityService.addActivityToCollectionIfMissing).toHaveBeenCalledWith(
        activityCollection,
        ...additionalActivities.map(expect.objectContaining),
      );
      expect(comp.activitiesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call User query and add missing value', () => {
      const challenge: IChallenge = { id: 456 };
      const creator: IUser = { id: 30889 };
      challenge.creator = creator;
      const recipient: IUser = { id: 11875 };
      challenge.recipient = recipient;

      const userCollection: IUser[] = [{ id: 26853 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [creator, recipient];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ challenge });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const challenge: IChallenge = { id: 456 };
      const challenges: IProfile = { id: 24176 };
      challenge.challenges = challenges;
      const challengedFriend: IFriendsList = { id: 13338 };
      challenge.challengedFriend = challengedFriend;
      const challengedActivity: IActivity = { id: 21451 };
      challenge.challengedActivity = challengedActivity;
      const creator: IUser = { id: 18175 };
      challenge.creator = creator;
      const recipient: IUser = { id: 11973 };
      challenge.recipient = recipient;

      activatedRoute.data = of({ challenge });
      comp.ngOnInit();

      expect(comp.profilesSharedCollection).toContain(challenges);
      expect(comp.friendsListsSharedCollection).toContain(challengedFriend);
      expect(comp.activitiesSharedCollection).toContain(challengedActivity);
      expect(comp.usersSharedCollection).toContain(creator);
      expect(comp.usersSharedCollection).toContain(recipient);
      expect(comp.challenge).toEqual(challenge);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChallenge>>();
      const challenge = { id: 123 };
      jest.spyOn(challengeFormService, 'getChallenge').mockReturnValue(challenge);
      jest.spyOn(challengeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ challenge });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: challenge }));
      saveSubject.complete();

      // THEN
      expect(challengeFormService.getChallenge).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(challengeService.update).toHaveBeenCalledWith(expect.objectContaining(challenge));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChallenge>>();
      const challenge = { id: 123 };
      jest.spyOn(challengeFormService, 'getChallenge').mockReturnValue({ id: null });
      jest.spyOn(challengeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ challenge: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: challenge }));
      saveSubject.complete();

      // THEN
      expect(challengeFormService.getChallenge).toHaveBeenCalled();
      expect(challengeService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChallenge>>();
      const challenge = { id: 123 };
      jest.spyOn(challengeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ challenge });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(challengeService.update).toHaveBeenCalled();
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

    describe('compareFriendsList', () => {
      it('Should forward to friendsListService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(friendsListService, 'compareFriendsList');
        comp.compareFriendsList(entity, entity2);
        expect(friendsListService.compareFriendsList).toHaveBeenCalledWith(entity, entity2);
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

    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
