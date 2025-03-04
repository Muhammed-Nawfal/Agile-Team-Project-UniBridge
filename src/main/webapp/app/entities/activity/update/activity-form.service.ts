import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

type ActivityFormDefaults = Pick<NewActivity, 'id' | 'activityDate' | 'createdOn' | 'updatedOn'>;

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
  paid: FormControl<ActivityFormRawValue['paid']>;
  costOfactivity: FormControl<ActivityFormRawValue['costOfactivity']>;
  requesteduser: FormControl<ActivityFormRawValue['requesteduser']>;
};

export type ActivityFormGroup = FormGroup<ActivityFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ActivityFormService {
  createActivityFormGroup(activity: ActivityFormGroupInput = { id: null }): ActivityFormGroup {
    const activityRawValue = this.convertActivityToActivityRawValue({
      ...this.getFormDefaults(),
      ...activity,
    });
    return new FormGroup<ActivityFormGroupContent>({
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
        validators: [Validators.required],
      }),
      maxNumberOfParticipants: new FormControl(activityRawValue.maxNumberOfParticipants, {
        validators: [Validators.required, Validators.min(2)],
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
        validators: [Validators.required],
      }),
      coverImage: new FormControl(activityRawValue.coverImage),
      coverImageContentType: new FormControl(activityRawValue.coverImageContentType),
      paid: new FormControl(activityRawValue.paid, {
        validators: [Validators.required],
      }),
      costOfactivity: new FormControl(activityRawValue.costOfactivity, {
        validators: [Validators.required],
      }),
      requesteduser: new FormControl(activityRawValue.requesteduser),
    });
  }

  getActivity(form: ActivityFormGroup): IActivity | NewActivity {
    return this.convertActivityRawValueToActivity(form.getRawValue() as ActivityFormRawValue | NewActivityFormRawValue);
  }

  resetForm(form: ActivityFormGroup, activity: ActivityFormGroupInput): void {
    const activityRawValue = this.convertActivityToActivityRawValue({ ...this.getFormDefaults(), ...activity });
    form.reset(
      {
        ...activityRawValue,
        id: { value: activityRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ActivityFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      activityDate: currentTime,
      createdOn: currentTime,
      updatedOn: currentTime,
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
