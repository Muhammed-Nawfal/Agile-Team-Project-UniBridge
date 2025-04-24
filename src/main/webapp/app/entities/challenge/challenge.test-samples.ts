import dayjs from 'dayjs/esm';

import { IChallenge, NewChallenge } from './challenge.model';

export const sampleWithRequiredData: IChallenge = {
  id: 17094,
  title: 'rigid possible unused',
  description: '../fake-data/blob/hipster.txt',
  category: 'SOCIAL',
  date: dayjs('2025-03-11'),
  points: 18,
  badge: '../fake-data/blob/hipster.png',
  badgeContentType: 'unknown',
  completed: false,
};

export const sampleWithPartialData: IChallenge = {
  id: 7876,
  title: 'unhappy',
  description: '../fake-data/blob/hipster.txt',
  category: 'STUDY',
  date: dayjs('2025-03-11'),
  points: 72,
  badge: '../fake-data/blob/hipster.png',
  badgeContentType: 'unknown',
  completed: false,
};

export const sampleWithFullData: IChallenge = {
  id: 9936,
  title: 'dimly buck enormously',
  description: '../fake-data/blob/hipster.txt',
  category: 'PERSONAL_GROWTH',
  date: dayjs('2025-03-11'),
  points: 37,
  badge: '../fake-data/blob/hipster.png',
  badgeContentType: 'unknown',
  completed: true,
};

export const sampleWithNewData: NewChallenge = {
  title: 'aboard',
  description: '../fake-data/blob/hipster.txt',
  category: 'PERSONAL_GROWTH',
  date: dayjs('2025-03-11'),
  points: 33,
  badge: '../fake-data/blob/hipster.png',
  badgeContentType: 'unknown',
  completed: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
