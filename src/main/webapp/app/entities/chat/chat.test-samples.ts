import dayjs from 'dayjs/esm';

import { IChat, NewChat } from './chat.model';

export const sampleWithRequiredData: IChat = {
  id: 19155,
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-26T10:36'),
};

export const sampleWithPartialData: IChat = {
  id: 18917,
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-25T23:12'),
};

export const sampleWithFullData: IChat = {
  id: 17051,
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-26T12:28'),
};

export const sampleWithNewData: NewChat = {
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-26T11:52'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
