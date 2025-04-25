import dayjs from 'dayjs/esm';

import { IActivityMatch, NewActivityMatch } from './activity-match.model';

export const sampleWithRequiredData: IActivityMatch = {
  id: 16966,
  activityType: 'ACADEMIC',
  status: 'PENDING',
  matchDate: dayjs('2025-02-26'),
  matchTime: dayjs('2025-02-26T13:57'),
  createdAt: dayjs('2025-02-26T16:45'),
  responseAt: dayjs('2025-02-26T15:31'),
};

export const sampleWithPartialData: IActivityMatch = {
  id: 16186,
  activityType: 'SPORTS',
  status: 'PENDING',
  matchDate: dayjs('2025-02-26'),
  matchTime: dayjs('2025-02-26T06:36'),
  createdAt: dayjs('2025-02-26T04:43'),
  responseAt: dayjs('2025-02-26T02:51'),
};

export const sampleWithFullData: IActivityMatch = {
  id: 24454,
  activityType: 'SPORTS',
  status: 'ACCEPT',
  matchDate: dayjs('2025-02-26'),
  matchTime: dayjs('2025-02-26T13:05'),
  location: 'newsletter reel what',
  notes: '../fake-data/blob/hipster.txt',
  createdAt: dayjs('2025-02-26T13:01'),
  responseAt: dayjs('2025-02-26T17:06'),
};

export const sampleWithNewData: NewActivityMatch = {
  activityType: 'SPORTS',
  status: 'ACCEPT',
  matchDate: dayjs('2025-02-26'),
  matchTime: dayjs('2025-02-26T09:29'),
  createdAt: dayjs('2025-02-25T22:33'),
  responseAt: dayjs('2025-02-26T13:33'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
