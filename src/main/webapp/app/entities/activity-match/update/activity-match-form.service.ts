import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

type ActivityMatchFormDefaults = Pick<NewActivityMatch, 'id'>;

type ActivityMatchFormGroupContent = {
  id: FormControl<IActivityMatch['id'] | NewActivityMatch['id']>;
  activityType: FormControl<IActivityMatch['activityType']>;
  status: FormControl<IActivityMatch['status']>;
  requestUser: FormControl<IActivityMatch['requestUser']>;
  matchedUser: FormControl<IActivityMatch['matchedUser']>;
};

export type ActivityMatchFormGroup = FormGroup<ActivityMatchFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ActivityMatchFormService {
  createActivityMatchFormGroup(activityMatch: ActivityMatchFormGroupInput = { id: null }): ActivityMatchFormGroup {
    const activityMatchRawValue = {
      ...this.getFormDefaults(),
      ...activityMatch,
    };
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
      requestUser: new FormControl(activityMatchRawValue.requestUser),
      matchedUser: new FormControl(activityMatchRawValue.matchedUser),
    });
  }

  getActivityMatch(form: ActivityMatchFormGroup): IActivityMatch | NewActivityMatch {
    return form.getRawValue() as IActivityMatch | NewActivityMatch;
  }

  resetForm(form: ActivityMatchFormGroup, activityMatch: ActivityMatchFormGroupInput): void {
    const activityMatchRawValue = { ...this.getFormDefaults(), ...activityMatch };
    form.reset(
      {
        ...activityMatchRawValue,
        id: { value: activityMatchRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ActivityMatchFormDefaults {
    return {
      id: null,
    };
  }
}
