import dayjs from 'dayjs/esm';

import { INotification, NewNotification } from './notification.model';

export const sampleWithRequiredData: INotification = {
  id: 20347,
  notificationType: 'BOOKING_CONFIRMATION',
  title: 'serpentine',
  message: 'yearn',
  timestamp: dayjs('2025-02-25T18:57'),
  isRead: true,
};

export const sampleWithPartialData: INotification = {
  id: 13549,
  notificationType: 'FRIEND_REQUEST',
  title: 'sensitize pulverize',
  message: 'outfox parallel or',
  timestamp: dayjs('2025-02-25T18:51'),
  isRead: false,
};

export const sampleWithFullData: INotification = {
  id: 18892,
  notificationType: 'BOOKING_CONFIRMATION',
  title: 'aw gadzooks',
  message: 'firm whenever',
  timestamp: dayjs('2025-02-25T20:22'),
  isRead: true,
};

export const sampleWithNewData: NewNotification = {
  notificationType: 'BOOKING_CONFIRMATION',
  title: 'inveigle',
  message: 'tensely off',
  timestamp: dayjs('2025-02-26T06:38'),
  isRead: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
