import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ChatService } from '../service/chat.service';
import { IChat } from '../chat.model';
import { ChatFormService } from './chat-form.service';

import { ChatUpdateComponent } from './chat-update.component';

describe('Chat Management Update Component', () => {
  let comp: ChatUpdateComponent;
  let fixture: ComponentFixture<ChatUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let chatFormService: ChatFormService;
  let chatService: ChatService;
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
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const chat: IChat = { id: 456 };
      const senderID: IUser = { id: 28314 };
      chat.senderID = senderID;
      const recieverID: IUser = { id: 862 };
      chat.recieverID = recieverID;

      const userCollection: IUser[] = [{ id: 25854 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [senderID, recieverID];
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
      const senderID: IUser = { id: 7297 };
      chat.senderID = senderID;
      const recieverID: IUser = { id: 31690 };
      chat.recieverID = recieverID;

      activatedRoute.data = of({ chat });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(senderID);
      expect(comp.usersSharedCollection).toContain(recieverID);
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
