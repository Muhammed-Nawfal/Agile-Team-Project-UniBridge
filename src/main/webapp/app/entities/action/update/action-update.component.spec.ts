import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ActionService } from '../service/action.service';
import { IAction } from '../action.model';
import { ActionFormService } from './action-form.service';

import { ActionUpdateComponent } from './action-update.component';

describe('Action Management Update Component', () => {
  let comp: ActionUpdateComponent;
  let fixture: ComponentFixture<ActionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let actionFormService: ActionFormService;
  let actionService: ActionService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActionUpdateComponent],
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
      .overrideTemplate(ActionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ActionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    actionFormService = TestBed.inject(ActionFormService);
    actionService = TestBed.inject(ActionService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const action: IAction = { id: 456 };
      const performedByID: IUser = { id: 116 };
      action.performedByID = performedByID;
      const targetUserID: IUser = { id: 20859 };
      action.targetUserID = targetUserID;

      const userCollection: IUser[] = [{ id: 4953 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [performedByID, targetUserID];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ action });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const action: IAction = { id: 456 };
      const performedByID: IUser = { id: 25679 };
      action.performedByID = performedByID;
      const targetUserID: IUser = { id: 15677 };
      action.targetUserID = targetUserID;

      activatedRoute.data = of({ action });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(performedByID);
      expect(comp.usersSharedCollection).toContain(targetUserID);
      expect(comp.action).toEqual(action);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAction>>();
      const action = { id: 123 };
      jest.spyOn(actionFormService, 'getAction').mockReturnValue(action);
      jest.spyOn(actionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ action });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: action }));
      saveSubject.complete();

      // THEN
      expect(actionFormService.getAction).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(actionService.update).toHaveBeenCalledWith(expect.objectContaining(action));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAction>>();
      const action = { id: 123 };
      jest.spyOn(actionFormService, 'getAction').mockReturnValue({ id: null });
      jest.spyOn(actionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ action: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: action }));
      saveSubject.complete();

      // THEN
      expect(actionFormService.getAction).toHaveBeenCalled();
      expect(actionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAction>>();
      const action = { id: 123 };
      jest.spyOn(actionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ action });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(actionService.update).toHaveBeenCalled();
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
