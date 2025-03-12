import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IFriendsList } from 'app/entities/friends-list/friends-list.model';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IChat } from '../chat.model';
import { ChatService } from '../service/chat.service';
import { ChatFormService } from './chat-form.service';

import { ChatUpdateComponent } from './chat-update.component';

describe('Chat Management Update Component', () => {
  let comp: ChatUpdateComponent;
  let fixture: ComponentFixture<ChatUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let chatFormService: ChatFormService;
  let chatService: ChatService;
  let friendsListService: FriendsListService;
  let profileService: ProfileService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatUpdateComponent],
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
      .overrideTemplate(ChatUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ChatUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    chatFormService = TestBed.inject(ChatFormService);
    chatService = TestBed.inject(ChatService);
    friendsListService = TestBed.inject(FriendsListService);
    profileService = TestBed.inject(ProfileService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call friendChat query and add missing value', () => {
      const chat: IChat = { id: 456 };
      const friendChat: IFriendsList = { id: 30969 };
      chat.friendChat = friendChat;

      const friendChatCollection: IFriendsList[] = [{ id: 12582 }];
      jest.spyOn(friendsListService, 'query').mockReturnValue(of(new HttpResponse({ body: friendChatCollection })));
      const expectedCollection: IFriendsList[] = [friendChat, ...friendChatCollection];
      jest.spyOn(friendsListService, 'addFriendsListToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ chat });
      comp.ngOnInit();

      expect(friendsListService.query).toHaveBeenCalled();
      expect(friendsListService.addFriendsListToCollectionIfMissing).toHaveBeenCalledWith(friendChatCollection, friendChat);
      expect(comp.friendChatsCollection).toEqual(expectedCollection);
    });

    it('Should call Profile query and add missing value', () => {
      const chat: IChat = { id: 456 };
      const chats: IProfile = { id: 3096 };
      chat.chats = chats;

      const profileCollection: IProfile[] = [{ id: 5115 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [chats];
      const expectedCollection: IProfile[] = [...additionalProfiles, ...profileCollection];
      jest.spyOn(profileService, 'addProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ chat });
      comp.ngOnInit();

      expect(profileService.query).toHaveBeenCalled();
      expect(profileService.addProfileToCollectionIfMissing).toHaveBeenCalledWith(
        profileCollection,
        ...additionalProfiles.map(expect.objectContaining),
      );
      expect(comp.profilesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call User query and add missing value', () => {
      const chat: IChat = { id: 456 };
      const sender: IUser = { id: 23627 };
      chat.sender = sender;
      const receiver: IUser = { id: 16867 };
      chat.receiver = receiver;

      const userCollection: IUser[] = [{ id: 5292 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [sender, receiver];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ chat });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const chat: IChat = { id: 456 };
      const friendChat: IFriendsList = { id: 22626 };
      chat.friendChat = friendChat;
      const chats: IProfile = { id: 5733 };
      chat.chats = chats;
      const sender: IUser = { id: 28666 };
      chat.sender = sender;
      const receiver: IUser = { id: 9766 };
      chat.receiver = receiver;

      activatedRoute.data = of({ chat });
      comp.ngOnInit();

      expect(comp.friendChatsCollection).toContain(friendChat);
      expect(comp.profilesSharedCollection).toContain(chats);
      expect(comp.usersSharedCollection).toContain(sender);
      expect(comp.usersSharedCollection).toContain(receiver);
      expect(comp.chat).toEqual(chat);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChat>>();
      const chat = { id: 123 };
      jest.spyOn(chatFormService, 'getChat').mockReturnValue(chat);
      jest.spyOn(chatService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: chat }));
      saveSubject.complete();

      // THEN
      expect(chatFormService.getChat).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(chatService.update).toHaveBeenCalledWith(expect.objectContaining(chat));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChat>>();
      const chat = { id: 123 };
      jest.spyOn(chatFormService, 'getChat').mockReturnValue({ id: null });
      jest.spyOn(chatService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chat: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: chat }));
      saveSubject.complete();

      // THEN
      expect(chatFormService.getChat).toHaveBeenCalled();
      expect(chatService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChat>>();
      const chat = { id: 123 };
      jest.spyOn(chatService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(chatService.update).toHaveBeenCalled();
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
