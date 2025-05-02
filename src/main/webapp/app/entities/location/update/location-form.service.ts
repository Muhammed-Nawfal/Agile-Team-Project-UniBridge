import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ILocation, NewLocation } from '../location.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILocation for edit and NewLocationFormGroupInput for create.
 */
type LocationFormGroupInput = ILocation | PartialWithRequiredKeyOf<NewLocation>;

type LocationFormDefaults = Pick<NewLocation, 'id' | 'isCapacityBased'>;

type LocationFormGroupContent = {
  id: FormControl<ILocation['id'] | NewLocation['id']>;
  name: FormControl<ILocation['name']>;
  status: FormControl<ILocation['status']>;
  capacity: FormControl<ILocation['capacity']>;
  remainingCapacity: FormControl<ILocation['remainingCapacity']>;
  isCapacityBased: FormControl<ILocation['isCapacityBased']>;
};

export type LocationFormGroup = FormGroup<LocationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LocationFormService {
  createLocationFormGroup(location: LocationFormGroupInput = { id: null }): LocationFormGroup {
    const locationRawValue = {
      ...this.getFormDefaults(),
      ...location,
    };
    return new FormGroup<LocationFormGroupContent>({
      id: new FormControl(
        { value: locationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(locationRawValue.name, {
        validators: [Validators.required],
      }),
      status: new FormControl(locationRawValue.status, {
        validators: [Validators.required],
      }),
      capacity: new FormControl(locationRawValue.capacity, {
        validators: [Validators.required],
      }),
      remainingCapacity: new FormControl(locationRawValue.remainingCapacity),
      isCapacityBased: new FormControl(locationRawValue.isCapacityBased, {
        validators: [Validators.required],
      }),
    });
  }

  getLocation(form: LocationFormGroup): ILocation | NewLocation {
    return form.getRawValue() as ILocation | NewLocation;
  }

  resetForm(form: LocationFormGroup, location: LocationFormGroupInput): void {
    const locationRawValue = { ...this.getFormDefaults(), ...location };
    form.reset(
      {
        ...locationRawValue,
        id: { value: locationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): LocationFormDefaults {
    return {
      id: null,
      isCapacityBased: false,
    };
  }
}
