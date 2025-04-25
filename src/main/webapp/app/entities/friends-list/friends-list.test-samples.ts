import dayjs from 'dayjs/esm';

import { IFriendsList, NewFriendsList } from './friends-list.model';

export const sampleWithRequiredData: IFriendsList = {
  id: 8290,
  requestTime: dayjs('2025-02-26T05:44'),
  requestStatus: 'PENDING',
  friendSince: dayjs('2025-02-26T11:49'),
};

export const sampleWithPartialData: IFriendsList = {
  id: 13239,
  requestTime: dayjs('2025-02-26T00:14'),
  requestStatus: 'ACCEPT',
  friendSince: dayjs('2025-02-26T03:21'),
  nickname: 'chase',
};

export const sampleWithFullData: IFriendsList = {
  id: 18210,
  requestTime: dayjs('2025-02-26T13:20'),
  requestStatus: 'PENDING',
  friendSince: dayjs('2025-02-26T07:06'),
  nickname: 'broadside certify',
};

export const sampleWithNewData: NewFriendsList = {
  requestTime: dayjs('2025-02-25T23:19'),
  requestStatus: 'DECLINED',
  friendSince: dayjs('2025-02-25T18:06'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
