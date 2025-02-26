import dayjs from 'dayjs/esm';

import { IActivity, NewActivity } from './activity.model';

export const sampleWithRequiredData: IActivity = {
  id: 29311,
  activityName: 'exacerbate',
  activityType: 'GYM',
  activityDate: dayjs('2025-02-25T20:03'),
  numberOfParticipants: 28661,
  maxNumberOfParticipants: 26089,
  location: 'joshingly upwardly',
  createdOn: dayjs('2025-02-26T14:02'),
  updatedOn: dayjs('2025-02-26T13:06'),
  status: 'FINISHED',
  paid: 'NOTPAID',
  costOfactivity: 7871.76,
};

export const sampleWithPartialData: IActivity = {
  id: 31462,
  activityName: 'unless',
  activityType: 'OTHER',
  activityDate: dayjs('2025-02-25T23:28'),
  numberOfParticipants: 6685,
  maxNumberOfParticipants: 25770,
  location: 'dock catalyze afford',
  createdOn: dayjs('2025-02-26T10:53'),
  updatedOn: dayjs('2025-02-26T10:44'),
  status: 'CANCELED',
  coverImage: '../fake-data/blob/hipster.png',
  coverImageContentType: 'unknown',
  paid: 'NOTPAID',
  costOfactivity: 17929.15,
};

export const sampleWithFullData: IActivity = {
  id: 20256,
  activityName: 'creamy whereas',
  activityType: 'SPORTS',
  activityDate: dayjs('2025-02-26T02:05'),
  numberOfParticipants: 15888,
  maxNumberOfParticipants: 24734,
  location: 'suddenly widow',
  description: '../fake-data/blob/hipster.txt',
  createdOn: dayjs('2025-02-25T20:18'),
  updatedOn: dayjs('2025-02-25T17:49'),
  status: 'CURRENTLY_HAPPENING',
  coverImage: '../fake-data/blob/hipster.png',
  coverImageContentType: 'unknown',
  paid: 'PAID',
  costOfactivity: 24101.07,
};

export const sampleWithNewData: NewActivity = {
  activityName: 'beyond towards',
  activityType: 'GYM',
  activityDate: dayjs('2025-02-26T03:38'),
  numberOfParticipants: 10624,
  maxNumberOfParticipants: 404,
  location: 'oil',
  createdOn: dayjs('2025-02-26T01:41'),
  updatedOn: dayjs('2025-02-26T08:07'),
  status: 'CANCELED',
  paid: 'NOTPAID',
  costOfactivity: 30464.77,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
