import dayjs from 'dayjs/esm';

import { IActivityParticipant, NewActivityParticipant } from './activity-participant.model';

export const sampleWithRequiredData: IActivityParticipant = {
  id: 21730,
  joinedDate: dayjs('2025-04-23T16:03'),
  status: 'PENDING',
};

export const sampleWithPartialData: IActivityParticipant = {
  id: 24176,
  joinedDate: dayjs('2025-04-23T12:24'),
  status: 'CANCELED',
};

export const sampleWithFullData: IActivityParticipant = {
  id: 3988,
  joinedDate: dayjs('2025-04-24T02:30'),
  status: 'CANCELED',
};

export const sampleWithNewData: NewActivityParticipant = {
  joinedDate: dayjs('2025-04-24T07:20'),
  status: 'CANCELED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
