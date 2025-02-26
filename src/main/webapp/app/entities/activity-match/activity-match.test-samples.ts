import { IActivityMatch, NewActivityMatch } from './activity-match.model';

export const sampleWithRequiredData: IActivityMatch = {
  id: 12820,
  activityType: 'SOCIAL',
  status: 'ACCEPT',
};

export const sampleWithPartialData: IActivityMatch = {
  id: 24024,
  activityType: 'SOCIAL',
  status: 'ACCEPT',
};

export const sampleWithFullData: IActivityMatch = {
  id: 27206,
  activityType: 'SOCIAL',
  status: 'DECLINED',
};

export const sampleWithNewData: NewActivityMatch = {
  activityType: 'GYM',
  status: 'DECLINED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
