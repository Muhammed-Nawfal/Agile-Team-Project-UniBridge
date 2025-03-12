import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../challenge.test-samples';

import { ChallengeFormService } from './challenge-form.service';

describe('Challenge Form Service', () => {
  let service: ChallengeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChallengeFormService);
  });

  describe('Service methods', () => {
    describe('createChallengeFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createChallengeFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            category: expect.any(Object),
            points: expect.any(Object),
            badge: expect.any(Object),
            createdDate: expect.any(Object),
            expiryDate: expect.any(Object),
            isCompleted: expect.any(Object),
            completedDate: expect.any(Object),
            isDisplayed: expect.any(Object),
            challenges: expect.any(Object),
            challengedFriend: expect.any(Object),
            challengedActivity: expect.any(Object),
            creator: expect.any(Object),
            recipient: expect.any(Object),
          }),
        );
      });

      it('passing IChallenge should create a new form with FormGroup', () => {
        const formGroup = service.createChallengeFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            category: expect.any(Object),
            points: expect.any(Object),
            badge: expect.any(Object),
            createdDate: expect.any(Object),
            expiryDate: expect.any(Object),
            isCompleted: expect.any(Object),
            completedDate: expect.any(Object),
            isDisplayed: expect.any(Object),
            challenges: expect.any(Object),
            challengedFriend: expect.any(Object),
            challengedActivity: expect.any(Object),
            creator: expect.any(Object),
            recipient: expect.any(Object),
          }),
        );
      });
    });

    describe('getChallenge', () => {
      it('should return NewChallenge for default Challenge initial value', () => {
        const formGroup = service.createChallengeFormGroup(sampleWithNewData);

        const challenge = service.getChallenge(formGroup) as any;

        expect(challenge).toMatchObject(sampleWithNewData);
      });

      it('should return NewChallenge for empty Challenge initial value', () => {
        const formGroup = service.createChallengeFormGroup();

        const challenge = service.getChallenge(formGroup) as any;

        expect(challenge).toMatchObject({});
      });

      it('should return IChallenge', () => {
        const formGroup = service.createChallengeFormGroup(sampleWithRequiredData);

        const challenge = service.getChallenge(formGroup) as any;

        expect(challenge).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IChallenge should not enable id FormControl', () => {
        const formGroup = service.createChallengeFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewChallenge should disable id FormControl', () => {
        const formGroup = service.createChallengeFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
