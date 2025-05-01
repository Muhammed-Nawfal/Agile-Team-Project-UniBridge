import dayjs from 'dayjs/esm';

import { IActivity, NewActivity } from './activity.model';

export const sampleWithRequiredData: IActivity = {
  id: 15210,
  activityName: 'insidious how',
  activityType: 'OTHER',
  activityDate: dayjs('2025-02-26T14:34'),
  numberOfParticipants: 1863,
  maxNumberOfParticipants: 22158,
  location: 'gee greedily pish',
  createdOn: dayjs('2025-02-26T12:57'),
  updatedOn: dayjs('2025-02-26T01:54'),
  status: 'CURRENTLY_HAPPENING',
  isPaid: false,
  activityCost: 4704.56,
};

export const sampleWithPartialData: IActivity = {
  id: 27261,
  activityName: 'huzzah',
  activityType: 'OTHER',
  activityDate: dayjs('2025-02-26T01:20'),
  numberOfParticipants: 18927,
  maxNumberOfParticipants: 23906,
  location: 'fencing',
  createdOn: dayjs('2025-02-26T12:13'),
  updatedOn: dayjs('2025-02-26T04:04'),
  status: 'CURRENTLY_HAPPENING',
  isPaid: false,
  activityCost: 32662.8,
};

export const sampleWithFullData: IActivity = {
  id: 13945,
  activityName: 'litter',
  activityType: 'SPORTS',
  activityDate: dayjs('2025-02-26T03:34'),
  numberOfParticipants: 13213,
  maxNumberOfParticipants: 1616,
  location: 'afore',
  description: '../fake-data/blob/hipster.txt',
  createdOn: dayjs('2025-02-26T16:05'),
  updatedOn: dayjs('2025-02-25T19:08'),
  status: 'ANNOUNCED',
  coverImage: '../fake-data/blob/hipster.png',
  coverImageContentType: 'unknown',
  isPaid: false,
  activityCost: 15745.19,
};

export const sampleWithNewData: NewActivity = {
  activityName: 'upright',
  activityType: 'GYM',
  activityDate: dayjs('2025-02-26T16:30'),
  numberOfParticipants: 18966,
  maxNumberOfParticipants: 13253,
  location: 'terrorise humiliating yum',
  createdOn: dayjs('2025-02-26T01:57'),
  updatedOn: dayjs('2025-02-26T06:56'),
  status: 'CURRENTLY_HAPPENING',
  isPaid: false,
  activityCost: 9962.4,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
