import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
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
  let profileService: ProfileService;

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

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Profile query and add missing value', () => {
      const challenge: IChallenge = { id: 456 };
      const assignedTo: IProfile = { id: 651 };
      challenge.assignedTo = assignedTo;
      const createdBy: IProfile = { id: 8979 };
      challenge.createdBy = createdBy;

      const profileCollection: IProfile[] = [{ id: 4227 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [assignedTo, createdBy];
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

    it('Should update editForm', () => {
      const challenge: IChallenge = { id: 456 };
      const assignedTo: IProfile = { id: 29830 };
      challenge.assignedTo = assignedTo;
      const createdBy: IProfile = { id: 21251 };
      challenge.createdBy = createdBy;

      activatedRoute.data = of({ challenge });
      comp.ngOnInit();

      expect(comp.profilesSharedCollection).toContain(assignedTo);
      expect(comp.profilesSharedCollection).toContain(createdBy);
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
  });
});
