import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../action.test-samples';

import { ActionFormService } from './action-form.service';

describe('Action Form Service', () => {
  let service: ActionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionFormService);
  });

  describe('Service methods', () => {
    describe('createActionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createActionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            type: expect.any(Object),
            timestamp: expect.any(Object),
            performedByID: expect.any(Object),
            targetUserID: expect.any(Object),
          }),
        );
      });

      it('passing IAction should create a new form with FormGroup', () => {
        const formGroup = service.createActionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            type: expect.any(Object),
            timestamp: expect.any(Object),
            performedByID: expect.any(Object),
            targetUserID: expect.any(Object),
          }),
        );
      });
    });

    describe('getAction', () => {
      it('should return NewAction for default Action initial value', () => {
        const formGroup = service.createActionFormGroup(sampleWithNewData);

        const action = service.getAction(formGroup) as any;

        expect(action).toMatchObject(sampleWithNewData);
      });

      it('should return NewAction for empty Action initial value', () => {
        const formGroup = service.createActionFormGroup();

        const action = service.getAction(formGroup) as any;

        expect(action).toMatchObject({});
      });

      it('should return IAction', () => {
        const formGroup = service.createActionFormGroup(sampleWithRequiredData);

        const action = service.getAction(formGroup) as any;

        expect(action).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAction should not enable id FormControl', () => {
        const formGroup = service.createActionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAction should disable id FormControl', () => {
        const formGroup = service.createActionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
