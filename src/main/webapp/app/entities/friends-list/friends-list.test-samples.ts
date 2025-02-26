import dayjs from 'dayjs/esm';

import { IFriendsList, NewFriendsList } from './friends-list.model';

export const sampleWithRequiredData: IFriendsList = {
  id: 18211,
  friendRequest: 'PENDING',
  friendSince: dayjs('2025-02-26T05:17'),
};

export const sampleWithPartialData: IFriendsList = {
  id: 21430,
  friendRequest: 'PENDING',
  friendSince: dayjs('2025-02-25T19:00'),
};

export const sampleWithFullData: IFriendsList = {
  id: 826,
  friendRequest: 'ACCEPT',
  friendSince: dayjs('2025-02-26T08:35'),
};

export const sampleWithNewData: NewFriendsList = {
  friendRequest: 'PENDING',
  friendSince: dayjs('2025-02-26T11:11'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
