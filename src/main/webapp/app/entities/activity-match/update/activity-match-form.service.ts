import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IActivityMatch, NewActivityMatch } from '../activity-match.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IActivityMatch for edit and NewActivityMatchFormGroupInput for create.
 */
type ActivityMatchFormGroupInput = IActivityMatch | PartialWithRequiredKeyOf<NewActivityMatch>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IActivityMatch | NewActivityMatch> = Omit<T, 'matchTime' | 'createdAt' | 'responseAt'> & {
  matchTime?: string | null;
  createdAt?: string | null;
  responseAt?: string | null;
};

type ActivityMatchFormRawValue = FormValueOf<IActivityMatch>;

type NewActivityMatchFormRawValue = FormValueOf<NewActivityMatch>;

type ActivityMatchFormDefaults = Pick<NewActivityMatch, 'id' | 'matchTime' | 'createdAt' | 'responseAt'>;

type ActivityMatchFormGroupContent = {
  id: FormControl<ActivityMatchFormRawValue['id'] | NewActivityMatch['id']>;
  activityType: FormControl<ActivityMatchFormRawValue['activityType']>;
  status: FormControl<ActivityMatchFormRawValue['status']>;
  matchDate: FormControl<ActivityMatchFormRawValue['matchDate']>;
  matchTime: FormControl<ActivityMatchFormRawValue['matchTime']>;
  location: FormControl<ActivityMatchFormRawValue['location']>;
  notes: FormControl<ActivityMatchFormRawValue['notes']>;
  createdAt: FormControl<ActivityMatchFormRawValue['createdAt']>;
  responseAt: FormControl<ActivityMatchFormRawValue['responseAt']>;
  ratings: FormControl<ActivityMatchFormRawValue['ratings']>;
  matchRequestor: FormControl<ActivityMatchFormRawValue['matchRequestor']>;
  userDetails: FormControl<ActivityMatchFormRawValue['userDetails']>;
  matchedActivity: FormControl<ActivityMatchFormRawValue['matchedActivity']>;
};

export type ActivityMatchFormGroup = FormGroup<ActivityMatchFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ActivityMatchFormService {
  createActivityMatchFormGroup(activityMatch: ActivityMatchFormGroupInput = { id: null }): ActivityMatchFormGroup {
    const activityMatchRawValue = this.convertActivityMatchToActivityMatchRawValue({
      ...this.getFormDefaults(),
      ...activityMatch,
    });
    return new FormGroup<ActivityMatchFormGroupContent>({
      id: new FormControl(
        { value: activityMatchRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      activityType: new FormControl(activityMatchRawValue.activityType, {
        validators: [Validators.required],
      }),
      status: new FormControl(activityMatchRawValue.status, {
        validators: [Validators.required],
      }),
      matchDate: new FormControl(activityMatchRawValue.matchDate, {
        validators: [Validators.required],
      }),
      matchTime: new FormControl(activityMatchRawValue.matchTime, {
        validators: [Validators.required],
      }),
      location: new FormControl(activityMatchRawValue.location, {
        validators: [Validators.maxLength(100)],
      }),
      notes: new FormControl(activityMatchRawValue.notes),
      createdAt: new FormControl(activityMatchRawValue.createdAt, {
        validators: [Validators.required],
      }),
      responseAt: new FormControl(activityMatchRawValue.responseAt, {
        validators: [Validators.required],
      }),
      ratings: new FormControl(activityMatchRawValue.ratings),
      matchRequestor: new FormControl(activityMatchRawValue.matchRequestor),
      userDetails: new FormControl(activityMatchRawValue.userDetails),
      matchedActivity: new FormControl(activityMatchRawValue.matchedActivity),
    });
  }

  getActivityMatch(form: ActivityMatchFormGroup): IActivityMatch | NewActivityMatch {
    return this.convertActivityMatchRawValueToActivityMatch(form.getRawValue() as ActivityMatchFormRawValue | NewActivityMatchFormRawValue);
  }

  resetForm(form: ActivityMatchFormGroup, activityMatch: ActivityMatchFormGroupInput): void {
    const activityMatchRawValue = this.convertActivityMatchToActivityMatchRawValue({ ...this.getFormDefaults(), ...activityMatch });
    form.reset(
      {
        ...activityMatchRawValue,
        id: { value: activityMatchRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ActivityMatchFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      matchTime: currentTime,
      createdAt: currentTime,
      responseAt: currentTime,
    };
  }

  private convertActivityMatchRawValueToActivityMatch(
    rawActivityMatch: ActivityMatchFormRawValue | NewActivityMatchFormRawValue,
  ): IActivityMatch | NewActivityMatch {
    return {
      ...rawActivityMatch,
      matchTime: dayjs(rawActivityMatch.matchTime, DATE_TIME_FORMAT),
      createdAt: dayjs(rawActivityMatch.createdAt, DATE_TIME_FORMAT),
      responseAt: dayjs(rawActivityMatch.responseAt, DATE_TIME_FORMAT),
    };
  }

  private convertActivityMatchToActivityMatchRawValue(
    activityMatch: IActivityMatch | (Partial<NewActivityMatch> & ActivityMatchFormDefaults),
  ): ActivityMatchFormRawValue | PartialWithRequiredKeyOf<NewActivityMatchFormRawValue> {
    return {
      ...activityMatch,
      matchTime: activityMatch.matchTime ? activityMatch.matchTime.format(DATE_TIME_FORMAT) : undefined,
      createdAt: activityMatch.createdAt ? activityMatch.createdAt.format(DATE_TIME_FORMAT) : undefined,
      responseAt: activityMatch.responseAt ? activityMatch.responseAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
