import dayjs from 'dayjs/esm';

import { IChallenge, NewChallenge } from './challenge.model';

export const sampleWithRequiredData: IChallenge = {
  id: 30567,
  title: 'whoever',
  description: '../fake-data/blob/hipster.txt',
  category: 'SPORTS',
  points: 21,
  badge: '../fake-data/blob/hipster.png',
  badgeContentType: 'unknown',
  createdDate: dayjs('2025-03-11T08:49'),
  isCompleted: true,
};

export const sampleWithPartialData: IChallenge = {
  id: 17916,
  title: 'thunderbolt ugh',
  description: '../fake-data/blob/hipster.txt',
  category: 'SOCIAL',
  points: 63,
  badge: '../fake-data/blob/hipster.png',
  badgeContentType: 'unknown',
  createdDate: dayjs('2025-03-10T22:37'),
  expiryDate: dayjs('2025-03-10T15:51'),
  isCompleted: true,
  completedDate: dayjs('2025-03-10T22:01'),
};

export const sampleWithFullData: IChallenge = {
  id: 16629,
  title: 'why modulo fast',
  description: '../fake-data/blob/hipster.txt',
  category: 'SOCIAL',
  points: 76,
  badge: '../fake-data/blob/hipster.png',
  badgeContentType: 'unknown',
  createdDate: dayjs('2025-03-11T06:31'),
  expiryDate: dayjs('2025-03-11T03:31'),
  isCompleted: false,
  completedDate: dayjs('2025-03-11T01:18'),
  isDisplayed: false,
};

export const sampleWithNewData: NewChallenge = {
  title: 'halt',
  description: '../fake-data/blob/hipster.txt',
  category: 'SPORTS',
  points: 34,
  badge: '../fake-data/blob/hipster.png',
  badgeContentType: 'unknown',
  createdDate: dayjs('2025-03-10T22:44'),
  isCompleted: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
