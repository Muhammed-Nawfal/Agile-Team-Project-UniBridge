import dayjs from 'dayjs/esm';

import { IBooking, NewBooking } from './booking.model';

export const sampleWithRequiredData: IBooking = {
  id: 19861,
  activityType: 'OTHER',
  eventType: 'FOOTBALL_PITCH',
  bookingDate: dayjs('2025-02-26'),
  partySize: 483,
  bookingStatus: 'CONFIRMED',
};

export const sampleWithPartialData: IBooking = {
  id: 31859,
  activityType: 'ACADEMIC',
  eventType: 'FOOTBALL_PITCH',
  bookingDate: dayjs('2025-02-26'),
  partySize: 9844,
  bookingStatus: 'CONFIRMED',
  createdAt: dayjs('2025-02-26T06:38'),
};

export const sampleWithFullData: IBooking = {
  id: 23669,
  activityType: 'SPORTS',
  eventType: 'BASKETBALL_COURT',
  bookingDate: dayjs('2025-02-26'),
  partySize: 21693,
  bookingStatus: 'CONFIRMED',
  createdAt: dayjs('2025-02-25T17:52'),
  assignedAt: dayjs('2025-02-26T03:26'),
};

export const sampleWithNewData: NewBooking = {
  activityType: 'GYM',
  eventType: 'FOOTBALL_PITCH',
  bookingDate: dayjs('2025-02-26'),
  partySize: 20680,
  bookingStatus: 'CANCELLED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
