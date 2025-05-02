import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IMessageThread } from 'app/entities/message-thread/message-thread.model';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
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
  let messageThreadService: MessageThreadService;
  let profileService: ProfileService;

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
    messageThreadService = TestBed.inject(MessageThreadService);
    profileService = TestBed.inject(ProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call MessageThread query and add missing value', () => {
      const chat: IChat = { id: 456 };
      const thread: IMessageThread = { id: 20023 };
      chat.thread = thread;
      const messageThread: IMessageThread = { id: 21456 };
      chat.messageThread = messageThread;

      const messageThreadCollection: IMessageThread[] = [{ id: 12541 }];
      jest.spyOn(messageThreadService, 'query').mockReturnValue(of(new HttpResponse({ body: messageThreadCollection })));
      const additionalMessageThreads = [thread, messageThread];
      const expectedCollection: IMessageThread[] = [...additionalMessageThreads, ...messageThreadCollection];
      jest.spyOn(messageThreadService, 'addMessageThreadToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ chat });
      comp.ngOnInit();

      expect(messageThreadService.query).toHaveBeenCalled();
      expect(messageThreadService.addMessageThreadToCollectionIfMissing).toHaveBeenCalledWith(
        messageThreadCollection,
        ...additionalMessageThreads.map(expect.objectContaining),
      );
      expect(comp.messageThreadsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Profile query and add missing value', () => {
      const chat: IChat = { id: 456 };
      const sender: IProfile = { id: 12164 };
      chat.sender = sender;
      const receiver: IProfile = { id: 32111 };
      chat.receiver = receiver;

      const profileCollection: IProfile[] = [{ id: 1792 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [sender, receiver];
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

    it('Should update editForm', () => {
      const chat: IChat = { id: 456 };
      const thread: IMessageThread = { id: 25266 };
      chat.thread = thread;
      const messageThread: IMessageThread = { id: 14076 };
      chat.messageThread = messageThread;
      const sender: IProfile = { id: 25233 };
      chat.sender = sender;
      const receiver: IProfile = { id: 18207 };
      chat.receiver = receiver;

      activatedRoute.data = of({ chat });
      comp.ngOnInit();

      expect(comp.messageThreadsSharedCollection).toContain(thread);
      expect(comp.messageThreadsSharedCollection).toContain(messageThread);
      expect(comp.profilesSharedCollection).toContain(sender);
      expect(comp.profilesSharedCollection).toContain(receiver);
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
    describe('compareMessageThread', () => {
      it('Should forward to messageThreadService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(messageThreadService, 'compareMessageThread');
        comp.compareMessageThread(entity, entity2);
        expect(messageThreadService.compareMessageThread).toHaveBeenCalledWith(entity, entity2);
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
