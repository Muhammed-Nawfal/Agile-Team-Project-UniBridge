import dayjs from 'dayjs/esm';

import { IFriendsList, NewFriendsList } from './friends-list.model';

export const sampleWithRequiredData: IFriendsList = {
  id: 30281,
  friendRequest: 'DECLINED',
  friendSince: dayjs('2025-02-25T17:41'),
};

export const sampleWithPartialData: IFriendsList = {
  id: 1374,
  friendRequest: 'ACCEPT',
  friendSince: dayjs('2025-02-26T08:44'),
};

export const sampleWithFullData: IFriendsList = {
  id: 28203,
  friendRequest: 'PENDING',
  friendSince: dayjs('2025-02-25T19:54'),
};

export const sampleWithNewData: NewFriendsList = {
  friendRequest: 'ACCEPT',
  friendSince: dayjs('2025-02-26T07:40'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
