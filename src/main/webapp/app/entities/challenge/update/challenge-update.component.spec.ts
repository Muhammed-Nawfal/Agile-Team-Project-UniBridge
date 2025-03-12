import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ChallengeService } from '../service/challenge.service';
import { IChallenge } from '../challenge.model';
import { ChallengeFormService } from './challenge-form.service';

import { ChallengeUpdateComponent } from './challenge-update.component';

describe('Challenge Management Update Component', () => {
  let comp: ChallengeUpdateComponent;
  let fixture: ComponentFixture<ChallengeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let challengeFormService: ChallengeFormService;
  let challengeService: ChallengeService;
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
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const challenge: IChallenge = { id: 456 };
      const creator: IUser = { id: 4532 };
      challenge.creator = creator;
      const recipient: IUser = { id: 11917 };
      challenge.recipient = recipient;

      const userCollection: IUser[] = [{ id: 18910 }];
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
      const creator: IUser = { id: 9078 };
      challenge.creator = creator;
      const recipient: IUser = { id: 7642 };
      challenge.recipient = recipient;

      activatedRoute.data = of({ challenge });
      comp.ngOnInit();

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
