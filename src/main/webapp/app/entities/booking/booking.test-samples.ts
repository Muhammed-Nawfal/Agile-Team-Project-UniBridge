import dayjs from 'dayjs/esm';

import { IBooking, NewBooking } from './booking.model';

export const sampleWithRequiredData: IBooking = {
  id: 13121,
  bookingName: 'intermix rosy',
  bookingStatus: 'FINISHED',
  bookingTime: dayjs('2025-02-26T05:54'),
  bookingDate: dayjs('2025-02-25T23:37'),
  phoneNum: 'painfully a',
  bookingType: 'SQUASH_COURT',
  numOfParticipants: 26109,
  bookStartTime: dayjs('2025-02-25T18:55'),
  bookEndTime: dayjs('2025-02-26T09:51'),
};

export const sampleWithPartialData: IBooking = {
  id: 8246,
  bookingName: 'gracefully',
  bookingStatus: 'CURRENTLY_HAPPENING',
  bookingTime: dayjs('2025-02-25T23:12'),
  bookingDate: dayjs('2025-02-26T12:32'),
  phoneNum: 'stunning pa',
  bookingType: 'SWIMMING_POOL',
  numOfParticipants: 26170,
  bookStartTime: dayjs('2025-02-26T07:39'),
  bookEndTime: dayjs('2025-02-26T13:10'),
};

export const sampleWithFullData: IBooking = {
  id: 10089,
  bookingName: 'ah',
  bookingStatus: 'ANNOUNCED',
  bookingTime: dayjs('2025-02-26T16:31'),
  bookingDate: dayjs('2025-02-26T04:14'),
  phoneNum: 'quietlyXXXX',
  bookingType: 'EVENT_ROOMS',
  numOfParticipants: 4587,
  bookStartTime: dayjs('2025-02-26T10:12'),
  bookEndTime: dayjs('2025-02-26T15:47'),
};

export const sampleWithNewData: NewBooking = {
  bookingName: 'than outside',
  bookingStatus: 'CANCELED',
  bookingTime: dayjs('2025-02-26T05:00'),
  bookingDate: dayjs('2025-02-26T04:29'),
  phoneNum: 'duh kosher ',
  bookingType: 'SWIMMING_POOL',
  numOfParticipants: 8756,
  bookStartTime: dayjs('2025-02-26T16:34'),
  bookEndTime: dayjs('2025-02-25T21:29'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
