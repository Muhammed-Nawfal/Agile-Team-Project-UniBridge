import dayjs from 'dayjs/esm';

import { IReview, NewReview } from './review.model';

export const sampleWithRequiredData: IReview = {
  id: 4572,
  datePublished: dayjs('2025-02-26T14:47'),
  star: 0.15,
};

export const sampleWithPartialData: IReview = {
  id: 17212,
  datePublished: dayjs('2025-02-26T04:06'),
  star: 2.91,
  text: 'playfully',
};

export const sampleWithFullData: IReview = {
  id: 11788,
  datePublished: dayjs('2025-02-26T09:26'),
  star: 3.88,
  text: 'over',
};

export const sampleWithNewData: NewReview = {
  datePublished: dayjs('2025-02-25T21:24'),
  star: 1.99,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
