import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../activity-participant.test-samples';

import { ActivityParticipantFormService } from './activity-participant-form.service';

describe('ActivityParticipant Form Service', () => {
  let service: ActivityParticipantFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityParticipantFormService);
  });

  describe('Service methods', () => {
    describe('createActivityParticipantFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createActivityParticipantFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            joinedDate: expect.any(Object),
            status: expect.any(Object),
            participant: expect.any(Object),
            activity: expect.any(Object),
          }),
        );
      });

      it('passing IActivityParticipant should create a new form with FormGroup', () => {
        const formGroup = service.createActivityParticipantFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            joinedDate: expect.any(Object),
            status: expect.any(Object),
            participant: expect.any(Object),
            activity: expect.any(Object),
          }),
        );
      });
    });

    describe('getActivityParticipant', () => {
      it('should return NewActivityParticipant for default ActivityParticipant initial value', () => {
        const formGroup = service.createActivityParticipantFormGroup(sampleWithNewData);

        const activityParticipant = service.getActivityParticipant(formGroup) as any;

        expect(activityParticipant).toMatchObject(sampleWithNewData);
      });

      it('should return NewActivityParticipant for empty ActivityParticipant initial value', () => {
        const formGroup = service.createActivityParticipantFormGroup();

        const activityParticipant = service.getActivityParticipant(formGroup) as any;

        expect(activityParticipant).toMatchObject({});
      });

      it('should return IActivityParticipant', () => {
        const formGroup = service.createActivityParticipantFormGroup(sampleWithRequiredData);

        const activityParticipant = service.getActivityParticipant(formGroup) as any;

        expect(activityParticipant).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IActivityParticipant should not enable id FormControl', () => {
        const formGroup = service.createActivityParticipantFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewActivityParticipant should disable id FormControl', () => {
        const formGroup = service.createActivityParticipantFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
