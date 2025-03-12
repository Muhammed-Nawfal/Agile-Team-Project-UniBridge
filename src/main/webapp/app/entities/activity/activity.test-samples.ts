import dayjs from 'dayjs/esm';

import { IActivity, NewActivity } from './activity.model';

export const sampleWithRequiredData: IActivity = {
  id: 24308,
  activityName: 'hopeful',
  activityType: 'SPORTS',
  activityDate: dayjs('2025-02-26T05:48'),
  numberOfParticipants: 6492,
  maxNumberOfParticipants: 30083,
  location: 'coolly lumbering which',
  createdOn: dayjs('2025-02-26T05:21'),
  updatedOn: dayjs('2025-02-26T05:07'),
  status: 'CANCELED',
  paid: 'NOTPAID',
  costOfactivity: 19396.97,
};

export const sampleWithPartialData: IActivity = {
  id: 407,
  activityName: 'stark',
  activityType: 'ACADEMIC',
  activityDate: dayjs('2025-02-26T14:35'),
  numberOfParticipants: 21587,
  maxNumberOfParticipants: 17482,
  location: 'restaurant verve',
  description: '../fake-data/blob/hipster.txt',
  createdOn: dayjs('2025-02-25T22:45'),
  updatedOn: dayjs('2025-02-25T17:40'),
  status: 'FINISHED',
  paid: 'NOTPAID',
  costOfactivity: 31232.01,
};

export const sampleWithFullData: IActivity = {
  id: 20243,
  activityName: 'after kissingly',
  activityType: 'ACADEMIC',
  activityDate: dayjs('2025-02-25T17:07'),
  numberOfParticipants: 21618,
  maxNumberOfParticipants: 29034,
  location: 'lonely as',
  description: '../fake-data/blob/hipster.txt',
  createdOn: dayjs('2025-02-26T14:42'),
  updatedOn: dayjs('2025-02-26T16:50'),
  status: 'CANCELED',
  coverImage: '../fake-data/blob/hipster.png',
  coverImageContentType: 'unknown',
  paid: 'NOTPAID',
  costOfactivity: 27985.94,
};

export const sampleWithNewData: NewActivity = {
  activityName: 'insistent staid ashamed',
  activityType: 'OTHER',
  activityDate: dayjs('2025-02-25T19:03'),
  numberOfParticipants: 27736,
  maxNumberOfParticipants: 1044,
  location: 'and times',
  createdOn: dayjs('2025-02-25T22:34'),
  updatedOn: dayjs('2025-02-25T18:52'),
  status: 'CANCELED',
  paid: 'NOTPAID',
  costOfactivity: 32221.17,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
