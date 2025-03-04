import dayjs from 'dayjs/esm';

import { INotification, NewNotification } from './notification.model';

export const sampleWithRequiredData: INotification = {
  id: 18558,
  notificationType: 'ACTIVITY_MATCH',
  title: 'gadzooks despite',
  message: 'openly',
  timestamp: dayjs('2025-02-26T16:59'),
  isRead: false,
};

export const sampleWithPartialData: INotification = {
  id: 21973,
  notificationType: 'ACTIVITY_MATCH',
  title: 'vague scoff ah',
  message: 'rewrite come meanwhile',
  timestamp: dayjs('2025-02-26T05:35'),
  isRead: true,
};

export const sampleWithFullData: INotification = {
  id: 8213,
  notificationType: 'ACTIVITY_MATCH',
  title: 'condense till encouragement',
  message: 'than considering',
  timestamp: dayjs('2025-02-26T12:24'),
  isRead: false,
};

export const sampleWithNewData: NewNotification = {
  notificationType: 'NEW_CHAT_MESSAGE',
  title: 'deliquesce',
  message: 'testify euphonium gosh',
  timestamp: dayjs('2025-02-26T03:32'),
  isRead: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
