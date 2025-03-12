import { IActivityMatch, NewActivityMatch } from './activity-match.model';

export const sampleWithRequiredData: IActivityMatch = {
  id: 458,
  activityType: 'OTHER',
  status: 'PENDING',
};

export const sampleWithPartialData: IActivityMatch = {
  id: 21833,
  activityType: 'SOCIAL',
  status: 'DECLINED',
};

export const sampleWithFullData: IActivityMatch = {
  id: 10511,
  activityType: 'ACADEMIC',
  status: 'PENDING',
};

export const sampleWithNewData: NewActivityMatch = {
  activityType: 'ACADEMIC',
  status: 'PENDING',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
