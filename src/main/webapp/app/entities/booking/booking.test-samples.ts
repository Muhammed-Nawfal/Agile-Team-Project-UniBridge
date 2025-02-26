import dayjs from 'dayjs/esm';

import { IBooking, NewBooking } from './booking.model';

export const sampleWithRequiredData: IBooking = {
  id: 8831,
  bookingName: 'plus despite',
  bookingStatus: 'CURRENTLY_HAPPENING',
  bookingTime: dayjs('2025-02-26T08:16'),
  bookingDate: dayjs('2025-02-26T10:02'),
  phoneNum: 'guestXXXXXX',
  bookingType: 'EVENT_ROOMS',
  numOfParticipants: 24854,
  bookStartTime: dayjs('2025-02-26T13:49'),
  bookEndTime: dayjs('2025-02-26T10:40'),
};

export const sampleWithPartialData: IBooking = {
  id: 13377,
  bookingName: 'elderly alongside near',
  bookingStatus: 'CANCELED',
  bookingTime: dayjs('2025-02-26T03:41'),
  bookingDate: dayjs('2025-02-25T21:21'),
  phoneNum: 'coollyXXXXX',
  bookingType: 'TENNIS_COURT',
  numOfParticipants: 12212,
  bookStartTime: dayjs('2025-02-26T07:38'),
  bookEndTime: dayjs('2025-02-26T05:22'),
};

export const sampleWithFullData: IBooking = {
  id: 3413,
  bookingName: 'entomb inwardly',
  bookingStatus: 'CANCELED',
  bookingTime: dayjs('2025-02-25T21:19'),
  bookingDate: dayjs('2025-02-26T11:02'),
  phoneNum: 'petal helpl',
  bookingType: 'SWIMMING_POOL',
  numOfParticipants: 2158,
  bookStartTime: dayjs('2025-02-26T09:27'),
  bookEndTime: dayjs('2025-02-25T23:01'),
};

export const sampleWithNewData: NewBooking = {
  bookingName: 'er congregate standard',
  bookingStatus: 'ANNOUNCED',
  bookingTime: dayjs('2025-02-26T15:27'),
  bookingDate: dayjs('2025-02-25T19:00'),
  phoneNum: 'geeXXXXXXXX',
  bookingType: 'EVENT_ROOMS',
  numOfParticipants: 26840,
  bookStartTime: dayjs('2025-02-25T20:55'),
  bookEndTime: dayjs('2025-02-25T22:31'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
