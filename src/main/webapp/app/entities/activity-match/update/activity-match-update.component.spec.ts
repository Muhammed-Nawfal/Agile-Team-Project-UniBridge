import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ActivityMatchService } from '../service/activity-match.service';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchFormService } from './activity-match-form.service';

import { ActivityMatchUpdateComponent } from './activity-match-update.component';

describe('ActivityMatch Management Update Component', () => {
  let comp: ActivityMatchUpdateComponent;
  let fixture: ComponentFixture<ActivityMatchUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let activityMatchFormService: ActivityMatchFormService;
  let activityMatchService: ActivityMatchService;
  let userService: UserService;

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
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const activityMatch: IActivityMatch = { id: 456 };
      const requestUser: IUser = { id: 26341 };
      activityMatch.requestUser = requestUser;
      const matchedUser: IUser = { id: 31796 };
      activityMatch.matchedUser = matchedUser;

      const userCollection: IUser[] = [{ id: 27495 }];
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

    it('Should update editForm', () => {
      const activityMatch: IActivityMatch = { id: 456 };
      const requestUser: IUser = { id: 28254 };
      activityMatch.requestUser = requestUser;
      const matchedUser: IUser = { id: 28058 };
      activityMatch.matchedUser = matchedUser;

      activatedRoute.data = of({ activityMatch });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(requestUser);
      expect(comp.usersSharedCollection).toContain(matchedUser);
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
