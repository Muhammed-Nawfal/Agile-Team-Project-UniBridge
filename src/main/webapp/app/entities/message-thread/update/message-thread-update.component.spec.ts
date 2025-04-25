import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IFriendsList } from 'app/entities/friends-list/friends-list.model';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';
import { IActivityMatch } from 'app/entities/activity-match/activity-match.model';
import { ActivityMatchService } from 'app/entities/activity-match/service/activity-match.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IMessageThread } from '../message-thread.model';
import { MessageThreadService } from '../service/message-thread.service';
import { MessageThreadFormService } from './message-thread-form.service';

import { MessageThreadUpdateComponent } from './message-thread-update.component';

describe('MessageThread Management Update Component', () => {
  let comp: MessageThreadUpdateComponent;
  let fixture: ComponentFixture<MessageThreadUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let messageThreadFormService: MessageThreadFormService;
  let messageThreadService: MessageThreadService;
  let friendsListService: FriendsListService;
  let activityMatchService: ActivityMatchService;
  let profileService: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MessageThreadUpdateComponent],
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
      .overrideTemplate(MessageThreadUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(MessageThreadUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    messageThreadFormService = TestBed.inject(MessageThreadFormService);
    messageThreadService = TestBed.inject(MessageThreadService);
    friendsListService = TestBed.inject(FriendsListService);
    activityMatchService = TestBed.inject(ActivityMatchService);
    profileService = TestBed.inject(ProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call friendChat query and add missing value', () => {
      const messageThread: IMessageThread = { id: 456 };
      const friendChat: IFriendsList = { id: 14293 };
      messageThread.friendChat = friendChat;

      const friendChatCollection: IFriendsList[] = [{ id: 11612 }];
      jest.spyOn(friendsListService, 'query').mockReturnValue(of(new HttpResponse({ body: friendChatCollection })));
      const expectedCollection: IFriendsList[] = [friendChat, ...friendChatCollection];
      jest.spyOn(friendsListService, 'addFriendsListToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ messageThread });
      comp.ngOnInit();

      expect(friendsListService.query).toHaveBeenCalled();
      expect(friendsListService.addFriendsListToCollectionIfMissing).toHaveBeenCalledWith(friendChatCollection, friendChat);
      expect(comp.friendChatsCollection).toEqual(expectedCollection);
    });

    it('Should call matchChat query and add missing value', () => {
      const messageThread: IMessageThread = { id: 456 };
      const matchChat: IActivityMatch = { id: 29140 };
      messageThread.matchChat = matchChat;

      const matchChatCollection: IActivityMatch[] = [{ id: 4269 }];
      jest.spyOn(activityMatchService, 'query').mockReturnValue(of(new HttpResponse({ body: matchChatCollection })));
      const expectedCollection: IActivityMatch[] = [matchChat, ...matchChatCollection];
      jest.spyOn(activityMatchService, 'addActivityMatchToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ messageThread });
      comp.ngOnInit();

      expect(activityMatchService.query).toHaveBeenCalled();
      expect(activityMatchService.addActivityMatchToCollectionIfMissing).toHaveBeenCalledWith(matchChatCollection, matchChat);
      expect(comp.matchChatsCollection).toEqual(expectedCollection);
    });

    it('Should call Profile query and add missing value', () => {
      const messageThread: IMessageThread = { id: 456 };
      const participants: IProfile[] = [{ id: 13482 }];
      messageThread.participants = participants;

      const profileCollection: IProfile[] = [{ id: 2160 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [...participants];
      const expectedCollection: IProfile[] = [...additionalProfiles, ...profileCollection];
      jest.spyOn(profileService, 'addProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ messageThread });
      comp.ngOnInit();

      expect(profileService.query).toHaveBeenCalled();
      expect(profileService.addProfileToCollectionIfMissing).toHaveBeenCalledWith(
        profileCollection,
        ...additionalProfiles.map(expect.objectContaining),
      );
      expect(comp.profilesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const messageThread: IMessageThread = { id: 456 };
      const friendChat: IFriendsList = { id: 30564 };
      messageThread.friendChat = friendChat;
      const matchChat: IActivityMatch = { id: 9516 };
      messageThread.matchChat = matchChat;
      const participants: IProfile = { id: 270 };
      messageThread.participants = [participants];

      activatedRoute.data = of({ messageThread });
      comp.ngOnInit();

      expect(comp.friendChatsCollection).toContain(friendChat);
      expect(comp.matchChatsCollection).toContain(matchChat);
      expect(comp.profilesSharedCollection).toContain(participants);
      expect(comp.messageThread).toEqual(messageThread);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMessageThread>>();
      const messageThread = { id: 123 };
      jest.spyOn(messageThreadFormService, 'getMessageThread').mockReturnValue(messageThread);
      jest.spyOn(messageThreadService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ messageThread });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: messageThread }));
      saveSubject.complete();

      // THEN
      expect(messageThreadFormService.getMessageThread).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(messageThreadService.update).toHaveBeenCalledWith(expect.objectContaining(messageThread));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMessageThread>>();
      const messageThread = { id: 123 };
      jest.spyOn(messageThreadFormService, 'getMessageThread').mockReturnValue({ id: null });
      jest.spyOn(messageThreadService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ messageThread: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: messageThread }));
      saveSubject.complete();

      // THEN
      expect(messageThreadFormService.getMessageThread).toHaveBeenCalled();
      expect(messageThreadService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMessageThread>>();
      const messageThread = { id: 123 };
      jest.spyOn(messageThreadService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ messageThread });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(messageThreadService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareFriendsList', () => {
      it('Should forward to friendsListService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(friendsListService, 'compareFriendsList');
        comp.compareFriendsList(entity, entity2);
        expect(friendsListService.compareFriendsList).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareActivityMatch', () => {
      it('Should forward to activityMatchService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(activityMatchService, 'compareActivityMatch');
        comp.compareActivityMatch(entity, entity2);
        expect(activityMatchService.compareActivityMatch).toHaveBeenCalledWith(entity, entity2);
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
  });
});
