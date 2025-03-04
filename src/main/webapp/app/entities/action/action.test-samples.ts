import dayjs from 'dayjs/esm';

import { IAction, NewAction } from './action.model';

export const sampleWithRequiredData: IAction = {
  id: 8201,
  type: 'UNMATCH',
  timestamp: dayjs('2025-02-26T03:01'),
};

export const sampleWithPartialData: IAction = {
  id: 17111,
  type: 'UNMATCH',
  timestamp: dayjs('2025-02-26T13:17'),
};

export const sampleWithFullData: IAction = {
  id: 8082,
  type: 'REPORT',
  timestamp: dayjs('2025-02-26T05:29'),
};

export const sampleWithNewData: NewAction = {
  type: 'UNMATCH',
  timestamp: dayjs('2025-02-26T07:49'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
