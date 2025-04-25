import dayjs from 'dayjs/esm';

import { IMessageThread, NewMessageThread } from './message-thread.model';

export const sampleWithRequiredData: IMessageThread = {
  id: 31807,
  isGroup: true,
  createdOn: dayjs('2025-04-23T16:40'),
};

export const sampleWithPartialData: IMessageThread = {
  id: 6047,
  isGroup: false,
  name: 'collectivization sweet next',
  createdOn: dayjs('2025-04-24T03:28'),
  updatedOn: dayjs('2025-04-23T09:31'),
};

export const sampleWithFullData: IMessageThread = {
  id: 23758,
  isGroup: true,
  name: 'pro offensively',
  createdOn: dayjs('2025-04-24T00:04'),
  updatedOn: dayjs('2025-04-23T17:21'),
};

export const sampleWithNewData: NewMessageThread = {
  isGroup: false,
  createdOn: dayjs('2025-04-23T17:14'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
