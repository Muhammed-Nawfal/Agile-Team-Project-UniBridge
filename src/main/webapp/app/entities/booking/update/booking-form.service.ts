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
type FormValueOf<T extends IBooking | NewBooking> = Omit<T, 'bookingTime' | 'bookingDate' | 'bookStartTime' | 'bookEndTime'> & {
  bookingTime?: string | null;
  bookingDate?: string | null;
  bookStartTime?: string | null;
  bookEndTime?: string | null;
};

type BookingFormRawValue = FormValueOf<IBooking>;

type NewBookingFormRawValue = FormValueOf<NewBooking>;

type BookingFormDefaults = Pick<NewBooking, 'id' | 'bookingTime' | 'bookingDate' | 'bookStartTime' | 'bookEndTime'>;

type BookingFormGroupContent = {
  id: FormControl<BookingFormRawValue['id'] | NewBooking['id']>;
  bookingName: FormControl<BookingFormRawValue['bookingName']>;
  bookingStatus: FormControl<BookingFormRawValue['bookingStatus']>;
  bookingTime: FormControl<BookingFormRawValue['bookingTime']>;
  bookingDate: FormControl<BookingFormRawValue['bookingDate']>;
  phoneNum: FormControl<BookingFormRawValue['phoneNum']>;
  bookingType: FormControl<BookingFormRawValue['bookingType']>;
  numOfParticipants: FormControl<BookingFormRawValue['numOfParticipants']>;
  bookStartTime: FormControl<BookingFormRawValue['bookStartTime']>;
  bookEndTime: FormControl<BookingFormRawValue['bookEndTime']>;
  requestedUser: FormControl<BookingFormRawValue['requestedUser']>;
  activity: FormControl<BookingFormRawValue['activity']>;
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
      bookingName: new FormControl(bookingRawValue.bookingName, {
        validators: [Validators.required],
      }),
      bookingStatus: new FormControl(bookingRawValue.bookingStatus, {
        validators: [Validators.required],
      }),
      bookingTime: new FormControl(bookingRawValue.bookingTime, {
        validators: [Validators.required],
      }),
      bookingDate: new FormControl(bookingRawValue.bookingDate, {
        validators: [Validators.required],
      }),
      phoneNum: new FormControl(bookingRawValue.phoneNum, {
        validators: [Validators.required, Validators.minLength(11), Validators.maxLength(11)],
      }),
      bookingType: new FormControl(bookingRawValue.bookingType, {
        validators: [Validators.required],
      }),
      numOfParticipants: new FormControl(bookingRawValue.numOfParticipants, {
        validators: [Validators.required, Validators.min(1)],
      }),
      bookStartTime: new FormControl(bookingRawValue.bookStartTime, {
        validators: [Validators.required],
      }),
      bookEndTime: new FormControl(bookingRawValue.bookEndTime, {
        validators: [Validators.required],
      }),
      requestedUser: new FormControl(bookingRawValue.requestedUser),
      activity: new FormControl(bookingRawValue.activity),
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
      bookingTime: currentTime,
      bookingDate: currentTime,
      bookStartTime: currentTime,
      bookEndTime: currentTime,
    };
  }

  private convertBookingRawValueToBooking(rawBooking: BookingFormRawValue | NewBookingFormRawValue): IBooking | NewBooking {
    return {
      ...rawBooking,
      bookingTime: dayjs(rawBooking.bookingTime, DATE_TIME_FORMAT),
      bookingDate: dayjs(rawBooking.bookingDate, DATE_TIME_FORMAT),
      bookStartTime: dayjs(rawBooking.bookStartTime, DATE_TIME_FORMAT),
      bookEndTime: dayjs(rawBooking.bookEndTime, DATE_TIME_FORMAT),
    };
  }

  private convertBookingToBookingRawValue(
    booking: IBooking | (Partial<NewBooking> & BookingFormDefaults),
  ): BookingFormRawValue | PartialWithRequiredKeyOf<NewBookingFormRawValue> {
    return {
      ...booking,
      bookingTime: booking.bookingTime ? booking.bookingTime.format(DATE_TIME_FORMAT) : undefined,
      bookingDate: booking.bookingDate ? booking.bookingDate.format(DATE_TIME_FORMAT) : undefined,
      bookStartTime: booking.bookStartTime ? booking.bookStartTime.format(DATE_TIME_FORMAT) : undefined,
      bookEndTime: booking.bookEndTime ? booking.bookEndTime.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
