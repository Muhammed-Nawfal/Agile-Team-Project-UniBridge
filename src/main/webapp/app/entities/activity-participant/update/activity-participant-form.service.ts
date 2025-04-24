import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IActivityParticipant, NewActivityParticipant } from '../activity-participant.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IActivityParticipant for edit and NewActivityParticipantFormGroupInput for create.
 */
type ActivityParticipantFormGroupInput = IActivityParticipant | PartialWithRequiredKeyOf<NewActivityParticipant>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IActivityParticipant | NewActivityParticipant> = Omit<T, 'joinedDate'> & {
  joinedDate?: string | null;
};

type ActivityParticipantFormRawValue = FormValueOf<IActivityParticipant>;

type NewActivityParticipantFormRawValue = FormValueOf<NewActivityParticipant>;

type ActivityParticipantFormDefaults = Pick<NewActivityParticipant, 'id' | 'joinedDate'>;

type ActivityParticipantFormGroupContent = {
  id: FormControl<ActivityParticipantFormRawValue['id'] | NewActivityParticipant['id']>;
  joinedDate: FormControl<ActivityParticipantFormRawValue['joinedDate']>;
  status: FormControl<ActivityParticipantFormRawValue['status']>;
  participant: FormControl<ActivityParticipantFormRawValue['participant']>;
  activity: FormControl<ActivityParticipantFormRawValue['activity']>;
};

export type ActivityParticipantFormGroup = FormGroup<ActivityParticipantFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ActivityParticipantFormService {
  createActivityParticipantFormGroup(activityParticipant: ActivityParticipantFormGroupInput = { id: null }): ActivityParticipantFormGroup {
    const activityParticipantRawValue = this.convertActivityParticipantToActivityParticipantRawValue({
      ...this.getFormDefaults(),
      ...activityParticipant,
    });
    return new FormGroup<ActivityParticipantFormGroupContent>({
      id: new FormControl(
        { value: activityParticipantRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      joinedDate: new FormControl(activityParticipantRawValue.joinedDate, {
        validators: [Validators.required],
      }),
      status: new FormControl(activityParticipantRawValue.status, {
        validators: [Validators.required],
      }),
      participant: new FormControl(activityParticipantRawValue.participant),
      activity: new FormControl(activityParticipantRawValue.activity),
    });
  }

  getActivityParticipant(form: ActivityParticipantFormGroup): IActivityParticipant | NewActivityParticipant {
    return this.convertActivityParticipantRawValueToActivityParticipant(
      form.getRawValue() as ActivityParticipantFormRawValue | NewActivityParticipantFormRawValue,
    );
  }

  resetForm(form: ActivityParticipantFormGroup, activityParticipant: ActivityParticipantFormGroupInput): void {
    const activityParticipantRawValue = this.convertActivityParticipantToActivityParticipantRawValue({
      ...this.getFormDefaults(),
      ...activityParticipant,
    });
    form.reset(
      {
        ...activityParticipantRawValue,
        id: { value: activityParticipantRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ActivityParticipantFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      joinedDate: currentTime,
    };
  }

  private convertActivityParticipantRawValueToActivityParticipant(
    rawActivityParticipant: ActivityParticipantFormRawValue | NewActivityParticipantFormRawValue,
  ): IActivityParticipant | NewActivityParticipant {
    return {
      ...rawActivityParticipant,
      joinedDate: dayjs(rawActivityParticipant.joinedDate, DATE_TIME_FORMAT),
    };
  }

  private convertActivityParticipantToActivityParticipantRawValue(
    activityParticipant: IActivityParticipant | (Partial<NewActivityParticipant> & ActivityParticipantFormDefaults),
  ): ActivityParticipantFormRawValue | PartialWithRequiredKeyOf<NewActivityParticipantFormRawValue> {
    return {
      ...activityParticipant,
      joinedDate: activityParticipant.joinedDate ? activityParticipant.joinedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
