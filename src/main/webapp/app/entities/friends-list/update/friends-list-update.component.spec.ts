import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IFriendsList } from '../friends-list.model';
import { FriendsListService } from '../service/friends-list.service';
import { FriendsListFormService } from './friends-list-form.service';

import { FriendsListUpdateComponent } from './friends-list-update.component';

describe('FriendsList Management Update Component', () => {
  let comp: FriendsListUpdateComponent;
  let fixture: ComponentFixture<FriendsListUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let friendsListFormService: FriendsListFormService;
  let friendsListService: FriendsListService;
  let profileService: ProfileService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FriendsListUpdateComponent],
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
      .overrideTemplate(FriendsListUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FriendsListUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    friendsListFormService = TestBed.inject(FriendsListFormService);
    friendsListService = TestBed.inject(FriendsListService);
    profileService = TestBed.inject(ProfileService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Profile query and add missing value', () => {
      const friendsList: IFriendsList = { id: 456 };
      const friends: IProfile = { id: 14334 };
      friendsList.friends = friends;

      const profileCollection: IProfile[] = [{ id: 7866 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [friends];
      const expectedCollection: IProfile[] = [...additionalProfiles, ...profileCollection];
      jest.spyOn(profileService, 'addProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ friendsList });
      comp.ngOnInit();

      expect(profileService.query).toHaveBeenCalled();
      expect(profileService.addProfileToCollectionIfMissing).toHaveBeenCalledWith(
        profileCollection,
        ...additionalProfiles.map(expect.objectContaining),
      );
      expect(comp.profilesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call User query and add missing value', () => {
      const friendsList: IFriendsList = { id: 456 };
      const user: IUser = { id: 14926 };
      friendsList.user = user;
      const friend: IUser = { id: 10849 };
      friendsList.friend = friend;

      const userCollection: IUser[] = [{ id: 5308 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user, friend];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ friendsList });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const friendsList: IFriendsList = { id: 456 };
      const friends: IProfile = { id: 23162 };
      friendsList.friends = friends;
      const user: IUser = { id: 26553 };
      friendsList.user = user;
      const friend: IUser = { id: 19377 };
      friendsList.friend = friend;

      activatedRoute.data = of({ friendsList });
      comp.ngOnInit();

      expect(comp.profilesSharedCollection).toContain(friends);
      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.usersSharedCollection).toContain(friend);
      expect(comp.friendsList).toEqual(friendsList);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFriendsList>>();
      const friendsList = { id: 123 };
      jest.spyOn(friendsListFormService, 'getFriendsList').mockReturnValue(friendsList);
      jest.spyOn(friendsListService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ friendsList });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: friendsList }));
      saveSubject.complete();

      // THEN
      expect(friendsListFormService.getFriendsList).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(friendsListService.update).toHaveBeenCalledWith(expect.objectContaining(friendsList));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFriendsList>>();
      const friendsList = { id: 123 };
      jest.spyOn(friendsListFormService, 'getFriendsList').mockReturnValue({ id: null });
      jest.spyOn(friendsListService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ friendsList: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: friendsList }));
      saveSubject.complete();

      // THEN
      expect(friendsListFormService.getFriendsList).toHaveBeenCalled();
      expect(friendsListService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFriendsList>>();
      const friendsList = { id: 123 };
      jest.spyOn(friendsListService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ friendsList });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(friendsListService.update).toHaveBeenCalled();
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
  });
});
