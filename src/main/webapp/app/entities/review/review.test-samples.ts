import dayjs from 'dayjs/esm';

import { IReview, NewReview } from './review.model';

export const sampleWithRequiredData: IReview = {
  id: 869,
  datePublished: dayjs('2025-02-25T20:15'),
  star: 3.13,
};

export const sampleWithPartialData: IReview = {
  id: 3891,
  datePublished: dayjs('2025-02-26T11:04'),
  star: 4.15,
  text: 'hourly annually',
};

export const sampleWithFullData: IReview = {
  id: 10144,
  datePublished: dayjs('2025-02-26T03:08'),
  star: 2.91,
  text: 'correctly',
};

export const sampleWithNewData: NewReview = {
  datePublished: dayjs('2025-02-25T20:52'),
  star: 2.5,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
