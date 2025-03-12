import dayjs from 'dayjs/esm';

import { IChat, NewChat } from './chat.model';

export const sampleWithRequiredData: IChat = {
  id: 24509,
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-26T15:38'),
  type: 'REPORT',
};

export const sampleWithPartialData: IChat = {
  id: 3847,
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-26T13:06'),
  type: 'REPORT',
};

export const sampleWithFullData: IChat = {
  id: 3956,
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-25T20:04'),
  type: 'UNMATCH',
};

export const sampleWithNewData: NewChat = {
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-26T00:07'),
  type: 'REPORT',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
