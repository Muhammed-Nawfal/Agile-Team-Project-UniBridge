import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITimeSlot, NewTimeSlot } from '../time-slot.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITimeSlot for edit and NewTimeSlotFormGroupInput for create.
 */
type TimeSlotFormGroupInput = ITimeSlot | PartialWithRequiredKeyOf<NewTimeSlot>;

type TimeSlotFormDefaults = Pick<NewTimeSlot, 'id'>;

type TimeSlotFormGroupContent = {
  id: FormControl<ITimeSlot['id'] | NewTimeSlot['id']>;
  date: FormControl<ITimeSlot['date']>;
  startHour: FormControl<ITimeSlot['startHour']>;
  endHour: FormControl<ITimeSlot['endHour']>;
  capacity: FormControl<ITimeSlot['capacity']>;
  remainingCapacity: FormControl<ITimeSlot['remainingCapacity']>;
  status: FormControl<ITimeSlot['status']>;
  event: FormControl<ITimeSlot['event']>;
  location: FormControl<ITimeSlot['location']>;
};

export type TimeSlotFormGroup = FormGroup<TimeSlotFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TimeSlotFormService {
  createTimeSlotFormGroup(timeSlot: TimeSlotFormGroupInput = { id: null }): TimeSlotFormGroup {
    const timeSlotRawValue = {
      ...this.getFormDefaults(),
      ...timeSlot,
    };
    return new FormGroup<TimeSlotFormGroupContent>({
      id: new FormControl(
        { value: timeSlotRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      date: new FormControl(timeSlotRawValue.date, {
        validators: [Validators.required],
      }),
      startHour: new FormControl(timeSlotRawValue.startHour, {
        validators: [Validators.required],
      }),
      endHour: new FormControl(timeSlotRawValue.endHour, {
        validators: [Validators.required],
      }),
      capacity: new FormControl(timeSlotRawValue.capacity, {
        validators: [Validators.required],
      }),
      remainingCapacity: new FormControl(timeSlotRawValue.remainingCapacity),
      status: new FormControl(timeSlotRawValue.status, {
        validators: [Validators.required],
      }),
      event: new FormControl(timeSlotRawValue.event),
      location: new FormControl(timeSlotRawValue.location),
    });
  }

  getTimeSlot(form: TimeSlotFormGroup): ITimeSlot | NewTimeSlot {
    return form.getRawValue() as ITimeSlot | NewTimeSlot;
  }

  resetForm(form: TimeSlotFormGroup, timeSlot: TimeSlotFormGroupInput): void {
    const timeSlotRawValue = { ...this.getFormDefaults(), ...timeSlot };
    form.reset(
      {
        ...timeSlotRawValue,
        id: { value: timeSlotRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TimeSlotFormDefaults {
    return {
      id: null,
    };
  }
}
