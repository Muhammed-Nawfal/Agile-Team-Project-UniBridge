import dayjs from 'dayjs/esm';

import { IReview, NewReview } from './review.model';

export const sampleWithRequiredData: IReview = {
  id: 4842,
  datePublished: dayjs('2025-02-26T15:54'),
  star: 3.21,
};

export const sampleWithPartialData: IReview = {
  id: 29165,
  datePublished: dayjs('2025-02-26T05:09'),
  star: 2.94,
};

export const sampleWithFullData: IReview = {
  id: 13849,
  datePublished: dayjs('2025-02-26T03:04'),
  star: 4.41,
  text: 'yum stool pick',
};

export const sampleWithNewData: NewReview = {
  datePublished: dayjs('2025-02-26T11:20'),
  star: 4.11,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
