import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../activity-match.test-samples';

import { ActivityMatchFormService } from './activity-match-form.service';

describe('ActivityMatch Form Service', () => {
  let service: ActivityMatchFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityMatchFormService);
  });

  describe('Service methods', () => {
    describe('createActivityMatchFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createActivityMatchFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            activityType: expect.any(Object),
            status: expect.any(Object),
            userName: expect.any(Object),
            requestUser: expect.any(Object),
            matchedUser: expect.any(Object),
            matchedActivity: expect.any(Object),
          }),
        );
      });

      it('passing IActivityMatch should create a new form with FormGroup', () => {
        const formGroup = service.createActivityMatchFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            activityType: expect.any(Object),
            status: expect.any(Object),
            userName: expect.any(Object),
            requestUser: expect.any(Object),
            matchedUser: expect.any(Object),
            matchedActivity: expect.any(Object),
          }),
        );
      });
    });

    describe('getActivityMatch', () => {
      it('should return NewActivityMatch for default ActivityMatch initial value', () => {
        const formGroup = service.createActivityMatchFormGroup(sampleWithNewData);

        const activityMatch = service.getActivityMatch(formGroup) as any;

        expect(activityMatch).toMatchObject(sampleWithNewData);
      });

      it('should return NewActivityMatch for empty ActivityMatch initial value', () => {
        const formGroup = service.createActivityMatchFormGroup();

        const activityMatch = service.getActivityMatch(formGroup) as any;

        expect(activityMatch).toMatchObject({});
      });

      it('should return IActivityMatch', () => {
        const formGroup = service.createActivityMatchFormGroup(sampleWithRequiredData);

        const activityMatch = service.getActivityMatch(formGroup) as any;

        expect(activityMatch).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IActivityMatch should not enable id FormControl', () => {
        const formGroup = service.createActivityMatchFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewActivityMatch should disable id FormControl', () => {
        const formGroup = service.createActivityMatchFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
