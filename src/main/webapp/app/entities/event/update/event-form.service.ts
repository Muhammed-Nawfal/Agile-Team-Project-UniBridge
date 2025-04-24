import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IEvent, NewEvent } from '../event.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IEvent for edit and NewEventFormGroupInput for create.
 */
type EventFormGroupInput = IEvent | PartialWithRequiredKeyOf<NewEvent>;

type EventFormDefaults = Pick<NewEvent, 'id'>;

type EventFormGroupContent = {
  id: FormControl<IEvent['id'] | NewEvent['id']>;
  name: FormControl<IEvent['name']>;
  value: FormControl<IEvent['value']>;
  activityType: FormControl<IEvent['activityType']>;
  minSize: FormControl<IEvent['minSize']>;
  maxSize: FormControl<IEvent['maxSize']>;
  startTime: FormControl<IEvent['startTime']>;
  endTime: FormControl<IEvent['endTime']>;
  capacity: FormControl<IEvent['capacity']>;
};

export type EventFormGroup = FormGroup<EventFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class EventFormService {
  createEventFormGroup(event: EventFormGroupInput = { id: null }): EventFormGroup {
    const eventRawValue = {
      ...this.getFormDefaults(),
      ...event,
    };
    return new FormGroup<EventFormGroupContent>({
      id: new FormControl(
        { value: eventRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(eventRawValue.name, {
        validators: [Validators.required],
      }),
      value: new FormControl(eventRawValue.value, {
        validators: [Validators.required],
      }),
      activityType: new FormControl(eventRawValue.activityType, {
        validators: [Validators.required],
      }),
      minSize: new FormControl(eventRawValue.minSize, {
        validators: [Validators.required],
      }),
      maxSize: new FormControl(eventRawValue.maxSize, {
        validators: [Validators.required],
      }),
      startTime: new FormControl(eventRawValue.startTime),
      endTime: new FormControl(eventRawValue.endTime),
      capacity: new FormControl(eventRawValue.capacity),
    });
  }

  getEvent(form: EventFormGroup): IEvent | NewEvent {
    return form.getRawValue() as IEvent | NewEvent;
  }

  resetForm(form: EventFormGroup, event: EventFormGroupInput): void {
    const eventRawValue = { ...this.getFormDefaults(), ...event };
    form.reset(
      {
        ...eventRawValue,
        id: { value: eventRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): EventFormDefaults {
    return {
      id: null,
    };
  }
}
