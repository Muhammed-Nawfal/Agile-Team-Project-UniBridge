import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../ranking.test-samples';

import { RankingFormService } from './ranking-form.service';

describe('Ranking Form Service', () => {
  let service: RankingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RankingFormService);
  });

  describe('Service methods', () => {
    describe('createRankingFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createRankingFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            reviewNumber: expect.any(Object),
            activityNumber: expect.any(Object),
            starAverage: expect.any(Object),
            reliable: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });

      it('passing IRanking should create a new form with FormGroup', () => {
        const formGroup = service.createRankingFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            reviewNumber: expect.any(Object),
            activityNumber: expect.any(Object),
            starAverage: expect.any(Object),
            reliable: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });
    });

    describe('getRanking', () => {
      it('should return NewRanking for default Ranking initial value', () => {
        const formGroup = service.createRankingFormGroup(sampleWithNewData);

        const ranking = service.getRanking(formGroup) as any;

        expect(ranking).toMatchObject(sampleWithNewData);
      });

      it('should return NewRanking for empty Ranking initial value', () => {
        const formGroup = service.createRankingFormGroup();

        const ranking = service.getRanking(formGroup) as any;

        expect(ranking).toMatchObject({});
      });

      it('should return IRanking', () => {
        const formGroup = service.createRankingFormGroup(sampleWithRequiredData);

        const ranking = service.getRanking(formGroup) as any;

        expect(ranking).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IRanking should not enable id FormControl', () => {
        const formGroup = service.createRankingFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewRanking should disable id FormControl', () => {
        const formGroup = service.createRankingFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
