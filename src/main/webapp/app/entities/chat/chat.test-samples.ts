import dayjs from 'dayjs/esm';

import { IChat, NewChat } from './chat.model';

export const sampleWithRequiredData: IChat = {
  id: 6246,
  timestamp: dayjs('2025-02-25T23:31'),
  status: 'DELIVERED',
  type: 'IMAGE',
  isDeleted: true,
  createdOn: dayjs('2025-02-25T17:55'),
};

export const sampleWithPartialData: IChat = {
  id: 21621,
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-26T02:47'),
  status: 'READ',
  type: 'IMAGE',
  isDeleted: true,
  createdOn: dayjs('2025-02-26T06:13'),
};

export const sampleWithFullData: IChat = {
  id: 15297,
  message: '../fake-data/blob/hipster.txt',
  timestamp: dayjs('2025-02-25T18:03'),
  status: 'READ',
  type: 'TEXT',
  media: '../fake-data/blob/hipster.png',
  mediaContentType: 'unknown',
  isDeleted: true,
  createdOn: dayjs('2025-02-26T12:08'),
  updatedOn: dayjs('2025-02-25T20:15'),
};

export const sampleWithNewData: NewChat = {
  timestamp: dayjs('2025-02-26T10:46'),
  status: 'DELIVERED',
  type: 'IMAGE',
  isDeleted: false,
  createdOn: dayjs('2025-02-25T20:09'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
