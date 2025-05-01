import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IBooking, NewBooking } from '../booking.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IBooking for edit and NewBookingFormGroupInput for create.
 */
type BookingFormGroupInput = IBooking | PartialWithRequiredKeyOf<NewBooking>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IBooking | NewBooking> = Omit<T, 'createdAt' | 'assignedAt'> & {
  createdAt?: string | null;
  assignedAt?: string | null;
};

type BookingFormRawValue = FormValueOf<IBooking>;

type NewBookingFormRawValue = FormValueOf<NewBooking>;

type BookingFormDefaults = Pick<NewBooking, 'id' | 'createdAt' | 'assignedAt'>;

type BookingFormGroupContent = {
  id: FormControl<BookingFormRawValue['id'] | NewBooking['id']>;
  activityType: FormControl<BookingFormRawValue['activityType']>;
  eventType: FormControl<BookingFormRawValue['eventType']>;
  bookingDate: FormControl<BookingFormRawValue['bookingDate']>;
  partySize: FormControl<BookingFormRawValue['partySize']>;
  bookingStatus: FormControl<BookingFormRawValue['bookingStatus']>;
  createdAt: FormControl<BookingFormRawValue['createdAt']>;
  assignedAt: FormControl<BookingFormRawValue['assignedAt']>;
  timeSlots: FormControl<BookingFormRawValue['timeSlots']>;
  bookedActivity: FormControl<BookingFormRawValue['bookedActivity']>;
  bookingLocation: FormControl<BookingFormRawValue['bookingLocation']>;
  creator: FormControl<BookingFormRawValue['creator']>;
  activity: FormControl<BookingFormRawValue['activity']>;
  timeSlot: FormControl<BookingFormRawValue['timeSlot']>;
};

export type BookingFormGroup = FormGroup<BookingFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class BookingFormService {
  createBookingFormGroup(booking: BookingFormGroupInput = { id: null }): BookingFormGroup {
    const bookingRawValue = this.convertBookingToBookingRawValue({
      ...this.getFormDefaults(),
      ...booking,
    });
    return new FormGroup<BookingFormGroupContent>({
      id: new FormControl(
        { value: bookingRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      activityType: new FormControl(bookingRawValue.activityType, {
        validators: [Validators.required],
      }),
      eventType: new FormControl(bookingRawValue.eventType, {
        validators: [Validators.required],
      }),
      bookingDate: new FormControl(bookingRawValue.bookingDate, {
        validators: [Validators.required],
      }),
      partySize: new FormControl(bookingRawValue.partySize, {
        validators: [Validators.required],
      }),
      bookingStatus: new FormControl(bookingRawValue.bookingStatus, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(bookingRawValue.createdAt),
      assignedAt: new FormControl(bookingRawValue.assignedAt),
      timeSlots: new FormControl(bookingRawValue.timeSlots),
      bookedActivity: new FormControl(bookingRawValue.bookedActivity),
      bookingLocation: new FormControl(bookingRawValue.bookingLocation),
      creator: new FormControl(bookingRawValue.creator),
      activity: new FormControl(bookingRawValue.activity),
      timeSlot: new FormControl(bookingRawValue.timeSlot),
    });
  }

  getBooking(form: BookingFormGroup): IBooking | NewBooking {
    return this.convertBookingRawValueToBooking(form.getRawValue() as BookingFormRawValue | NewBookingFormRawValue);
  }

  resetForm(form: BookingFormGroup, booking: BookingFormGroupInput): void {
    const bookingRawValue = this.convertBookingToBookingRawValue({ ...this.getFormDefaults(), ...booking });
    form.reset(
      {
        ...bookingRawValue,
        id: { value: bookingRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): BookingFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      assignedAt: currentTime,
    };
  }

  private convertBookingRawValueToBooking(rawBooking: BookingFormRawValue | NewBookingFormRawValue): IBooking | NewBooking {
    return {
      ...rawBooking,
      createdAt: dayjs(rawBooking.createdAt, DATE_TIME_FORMAT),
      assignedAt: dayjs(rawBooking.assignedAt, DATE_TIME_FORMAT),
    };
  }

  private convertBookingToBookingRawValue(
    booking: IBooking | (Partial<NewBooking> & BookingFormDefaults),
  ): BookingFormRawValue | PartialWithRequiredKeyOf<NewBookingFormRawValue> {
    return {
      ...booking,
      createdAt: booking.createdAt ? booking.createdAt.format(DATE_TIME_FORMAT) : undefined,
      assignedAt: booking.assignedAt ? booking.assignedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
