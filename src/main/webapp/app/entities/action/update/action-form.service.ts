import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAction, NewAction } from '../action.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAction for edit and NewActionFormGroupInput for create.
 */
type ActionFormGroupInput = IAction | PartialWithRequiredKeyOf<NewAction>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAction | NewAction> = Omit<T, 'timestamp'> & {
  timestamp?: string | null;
};

type ActionFormRawValue = FormValueOf<IAction>;

type NewActionFormRawValue = FormValueOf<NewAction>;

type ActionFormDefaults = Pick<NewAction, 'id' | 'timestamp'>;

type ActionFormGroupContent = {
  id: FormControl<ActionFormRawValue['id'] | NewAction['id']>;
  type: FormControl<ActionFormRawValue['type']>;
  timestamp: FormControl<ActionFormRawValue['timestamp']>;
  performedByID: FormControl<ActionFormRawValue['performedByID']>;
  targetUserID: FormControl<ActionFormRawValue['targetUserID']>;
};

export type ActionFormGroup = FormGroup<ActionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ActionFormService {
  createActionFormGroup(action: ActionFormGroupInput = { id: null }): ActionFormGroup {
    const actionRawValue = this.convertActionToActionRawValue({
      ...this.getFormDefaults(),
      ...action,
    });
    return new FormGroup<ActionFormGroupContent>({
      id: new FormControl(
        { value: actionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      type: new FormControl(actionRawValue.type, {
        validators: [Validators.required],
      }),
      timestamp: new FormControl(actionRawValue.timestamp, {
        validators: [Validators.required],
      }),
      performedByID: new FormControl(actionRawValue.performedByID),
      targetUserID: new FormControl(actionRawValue.targetUserID),
    });
  }

  getAction(form: ActionFormGroup): IAction | NewAction {
    return this.convertActionRawValueToAction(form.getRawValue() as ActionFormRawValue | NewActionFormRawValue);
  }

  resetForm(form: ActionFormGroup, action: ActionFormGroupInput): void {
    const actionRawValue = this.convertActionToActionRawValue({ ...this.getFormDefaults(), ...action });
    form.reset(
      {
        ...actionRawValue,
        id: { value: actionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ActionFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      timestamp: currentTime,
    };
  }

  private convertActionRawValueToAction(rawAction: ActionFormRawValue | NewActionFormRawValue): IAction | NewAction {
    return {
      ...rawAction,
      timestamp: dayjs(rawAction.timestamp, DATE_TIME_FORMAT),
    };
  }

  private convertActionToActionRawValue(
    action: IAction | (Partial<NewAction> & ActionFormDefaults),
  ): ActionFormRawValue | PartialWithRequiredKeyOf<NewActionFormRawValue> {
    return {
      ...action,
      timestamp: action.timestamp ? action.timestamp.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
