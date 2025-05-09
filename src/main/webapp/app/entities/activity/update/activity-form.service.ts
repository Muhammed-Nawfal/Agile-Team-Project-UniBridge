import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IActivity, NewActivity } from '../activity.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IActivity for edit and NewActivityFormGroupInput for create.
 */
type ActivityFormGroupInput = IActivity | PartialWithRequiredKeyOf<NewActivity>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IActivity | NewActivity> = Omit<T, 'activityDate' | 'createdOn' | 'updatedOn'> & {
  activityDate?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
};

type ActivityFormRawValue = FormValueOf<IActivity>;

type NewActivityFormRawValue = FormValueOf<NewActivity>;

type ActivityFormDefaults = Pick<NewActivity, 'id' | 'activityDate' | 'createdOn' | 'updatedOn' | 'isPaid'>;

type ActivityFormGroupContent = {
  id: FormControl<ActivityFormRawValue['id'] | NewActivity['id']>;
  activityName: FormControl<ActivityFormRawValue['activityName']>;
  activityType: FormControl<ActivityFormRawValue['activityType']>;
  activityDate: FormControl<ActivityFormRawValue['activityDate']>;
  numberOfParticipants: FormControl<ActivityFormRawValue['numberOfParticipants']>;
  maxNumberOfParticipants: FormControl<ActivityFormRawValue['maxNumberOfParticipants']>;
  location: FormControl<ActivityFormRawValue['location']>;
  description: FormControl<ActivityFormRawValue['description']>;
  createdOn: FormControl<ActivityFormRawValue['createdOn']>;
  updatedOn: FormControl<ActivityFormRawValue['updatedOn']>;
  status: FormControl<ActivityFormRawValue['status']>;
  coverImage: FormControl<ActivityFormRawValue['coverImage']>;
  coverImageContentType: FormControl<ActivityFormRawValue['coverImageContentType']>;
  isPaid: FormControl<ActivityFormRawValue['isPaid']>;
  activityCost: FormControl<ActivityFormRawValue['activityCost']>;
  creator: FormControl<ActivityFormRawValue['creator']>;
  challenge: FormControl<ActivityFormRawValue['challenge']>;
};

export type ActivityFormGroup = FormGroup<ActivityFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ActivityFormService {
  // Custom validator for cost constraints based on isPaid value
  activityCostValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const activityCost = control.value;
      const form = control.parent;
      if (!form) return null;

      const isPaid = form.get('isPaid')?.value;

      // if (isPaid === false && activityCost !== 0) {
      //   return { mustBeZeroWhenNotPaid: true };
      // }

      if (isPaid === false && activityCost !== 0) {
        return null;
      }

      if (isPaid === true && (activityCost === null || activityCost <= 0)) {
        return { mustBePositiveWhenPaid: true };
      }

      return null;
    };
  }

  // Validator to ensure the isPaid and activityCost are consistent
  isPaidValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isPaid = control.value;
      const form = control.parent;
      if (!form) return null;

      // When isPaid changes, validate activityCost
      const activityCostControl = form.get('activityCost');
      if (activityCostControl) {
        if (!isPaid) {
          activityCostControl.setValue(0);
        }
        // Force re-validation of activityCost
        activityCostControl.updateValueAndValidity();
      }

      return null;
    };
  }

  // Custom validator to prevent numberOfParticipants exceeding maxNumberOfParticipants
  maxParticipantsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const maxNumberOfParticipants = control.value;
      const form = control.parent;
      if (!form) return null;

      const numberOfParticipants = form.get('numberOfParticipants')?.value;

      if (numberOfParticipants !== null && maxNumberOfParticipants !== null && numberOfParticipants > maxNumberOfParticipants) {
        return { belowCurrentParticipants: true };
      }

      return null;
    };
  }

  // Custom validator to ensure numberOfParticipants doesn't exceed maxNumberOfParticipants
  numberOfParticipantsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const numberOfParticipants = control.value;
      const form = control.parent;
      if (!form) return null;

      const maxNumberOfParticipants = form.get('maxNumberOfParticipants')?.value;

      if (numberOfParticipants !== null && maxNumberOfParticipants !== null && numberOfParticipants > maxNumberOfParticipants) {
        return { exceedsMaxParticipants: true };
      }

      return null;
    };
  }

  createActivityFormGroup(activity: ActivityFormGroupInput = { id: null }): ActivityFormGroup {
    const activityRawValue = this.convertActivityToActivityRawValue({
      ...this.getFormDefaults(),
      ...activity,
    });

    const form = new FormGroup<ActivityFormGroupContent>({
      id: new FormControl(
        { value: activityRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      activityName: new FormControl(activityRawValue.activityName, {
        validators: [Validators.required, Validators.minLength(1), Validators.maxLength(120)],
      }),
      activityType: new FormControl(activityRawValue.activityType, {
        validators: [Validators.required],
      }),
      activityDate: new FormControl(activityRawValue.activityDate, {
        validators: [Validators.required],
      }),
      numberOfParticipants: new FormControl(activityRawValue.numberOfParticipants, {
        validators: [Validators.required, this.numberOfParticipantsValidator()],
      }),
      maxNumberOfParticipants: new FormControl(activityRawValue.maxNumberOfParticipants, {
        validators: [Validators.required, Validators.min(2), this.maxParticipantsValidator()],
      }),
      location: new FormControl(activityRawValue.location, {
        validators: [Validators.required, Validators.maxLength(95)],
      }),
      description: new FormControl(activityRawValue.description),
      createdOn: new FormControl(activityRawValue.createdOn, {
        validators: [Validators.required],
      }),
      updatedOn: new FormControl(activityRawValue.updatedOn, {
        validators: [Validators.required],
      }),
      status: new FormControl(activityRawValue.status, {
        validators: [Validators.required, this.statusValidator()],
      }),
      coverImage: new FormControl(activityRawValue.coverImage),
      coverImageContentType: new FormControl(activityRawValue.coverImageContentType),
      isPaid: new FormControl(activityRawValue.isPaid, {
        validators: [Validators.required, this.isPaidValidator()],
      }),
      activityCost: new FormControl(activityRawValue.activityCost, {
        validators: [this.activityCostValidator()],
      }),
      creator: new FormControl({
        value: activityRawValue.creator,
        disabled: activityRawValue.id !== null, // Disable creator field when editing (id exists)
      }),
      challenge: new FormControl(activityRawValue.challenge),
    });

    return form;
  }

  getActivity(form: ActivityFormGroup): IActivity | NewActivity {
    // Ensure the original creator is preserved when editing
    let formValue = form.getRawValue() as ActivityFormRawValue | NewActivityFormRawValue;

    // If form is in edit mode (id exists) and creator is disabled, get the original value
    if (formValue.id && form.get('creator')?.disabled) {
      const creatorControl = form.get('creator');
      if (creatorControl) {
        formValue = {
          ...formValue,
          creator: creatorControl.value,
        };
      }
    }

    return this.convertActivityRawValueToActivity(formValue);
  }

  resetForm(form: ActivityFormGroup, activity: ActivityFormGroupInput): void {
    const activityRawValue = this.convertActivityToActivityRawValue({ ...this.getFormDefaults(), ...activity });

    // Set default status for new activities and prevent CANCELLED
    if (!activity.id && activityRawValue.status === 'CANCELED') {
      activityRawValue.status = 'ANNOUNCED'; // Default to ACTIVE if trying to set CANCELLED on new activity
    }

    form.reset(
      {
        ...activityRawValue,
        id: { value: activityRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );

    // Disable creator field when editing
    if (activity.id) {
      form.get('creator')?.disable();
    }

    // Force validation after form reset to ensure constraints are applied immediately
    form.updateValueAndValidity();

    // Set initial activity cost to 0 if isPaid is false
    const isPaid = form.get('isPaid')?.value;
    if (isPaid === false) {
      form.get('activityCost')?.setValue(0);
    }
  }

  statusValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const status = control.value;
      const form = control.parent;
      if (!form) return null;

      const id = form.get('id')?.value;

      // If this is a new activity (id is null) and status is CANCELLED
      if (id === null && status === 'CANCELLED') {
        return { cancelledNotAllowedOnCreate: true };
      }

      return null;
    };
  }

  private getFormDefaults(): ActivityFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      activityDate: currentTime,
      createdOn: currentTime,
      updatedOn: currentTime,
      isPaid: false,
    };
  }

  private convertActivityRawValueToActivity(rawActivity: ActivityFormRawValue | NewActivityFormRawValue): IActivity | NewActivity {
    return {
      ...rawActivity,
      activityDate: dayjs(rawActivity.activityDate, DATE_TIME_FORMAT),
      createdOn: dayjs(rawActivity.createdOn, DATE_TIME_FORMAT),
      updatedOn: dayjs(rawActivity.updatedOn, DATE_TIME_FORMAT),
    };
  }

  private convertActivityToActivityRawValue(
    activity: IActivity | (Partial<NewActivity> & ActivityFormDefaults),
  ): ActivityFormRawValue | PartialWithRequiredKeyOf<NewActivityFormRawValue> {
    return {
      ...activity,
      activityDate: activity.activityDate ? activity.activityDate.format(DATE_TIME_FORMAT) : undefined,
      createdOn: activity.createdOn ? activity.createdOn.format(DATE_TIME_FORMAT) : undefined,
      updatedOn: activity.updatedOn ? activity.updatedOn.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
