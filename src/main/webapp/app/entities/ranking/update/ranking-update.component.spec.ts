import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { RankingService } from '../service/ranking.service';
import { IRanking } from '../ranking.model';
import { RankingFormService } from './ranking-form.service';

import { RankingUpdateComponent } from './ranking-update.component';

describe('Ranking Management Update Component', () => {
  let comp: RankingUpdateComponent;
  let fixture: ComponentFixture<RankingUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let rankingFormService: RankingFormService;
  let rankingService: RankingService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RankingUpdateComponent],
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
      .overrideTemplate(RankingUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(RankingUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    rankingFormService = TestBed.inject(RankingFormService);
    rankingService = TestBed.inject(RankingService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const ranking: IRanking = { id: 456 };
      const user: IUser = { id: 29565 };
      ranking.user = user;

      const userCollection: IUser[] = [{ id: 21831 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ ranking });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const ranking: IRanking = { id: 456 };
      const user: IUser = { id: 12492 };
      ranking.user = user;

      activatedRoute.data = of({ ranking });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.ranking).toEqual(ranking);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRanking>>();
      const ranking = { id: 123 };
      jest.spyOn(rankingFormService, 'getRanking').mockReturnValue(ranking);
      jest.spyOn(rankingService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ranking });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: ranking }));
      saveSubject.complete();

      // THEN
      expect(rankingFormService.getRanking).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(rankingService.update).toHaveBeenCalledWith(expect.objectContaining(ranking));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRanking>>();
      const ranking = { id: 123 };
      jest.spyOn(rankingFormService, 'getRanking').mockReturnValue({ id: null });
      jest.spyOn(rankingService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ranking: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: ranking }));
      saveSubject.complete();

      // THEN
      expect(rankingFormService.getRanking).toHaveBeenCalled();
      expect(rankingService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRanking>>();
      const ranking = { id: 123 };
      jest.spyOn(rankingService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ranking });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(rankingService.update).toHaveBeenCalled();
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
