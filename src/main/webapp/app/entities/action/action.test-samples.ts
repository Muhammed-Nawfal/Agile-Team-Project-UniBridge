import dayjs from 'dayjs/esm';

import { IAction, NewAction } from './action.model';

export const sampleWithRequiredData: IAction = {
  id: 24005,
  type: 'REPORT',
  timestamp: dayjs('2025-02-26T12:25'),
};

export const sampleWithPartialData: IAction = {
  id: 8389,
  type: 'UNMATCH',
  timestamp: dayjs('2025-02-26T14:10'),
};

export const sampleWithFullData: IAction = {
  id: 16701,
  type: 'REPORT',
  timestamp: dayjs('2025-02-26T13:57'),
};

export const sampleWithNewData: NewAction = {
  type: 'UNMATCH',
  timestamp: dayjs('2025-02-25T23:22'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
