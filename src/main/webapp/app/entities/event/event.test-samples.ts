import { IEvent, NewEvent } from './event.model';

export const sampleWithRequiredData: IEvent = {
  id: 24404,
  name: 'near',
  value: 'twin lazy',
  activityType: 'ACADEMIC',
  minSize: 17103,
  maxSize: 8444,
};

export const sampleWithPartialData: IEvent = {
  id: 3967,
  name: 'plain appropriate sequester',
  value: 'loosely although happily',
  activityType: 'OTHER',
  minSize: 10666,
  maxSize: 18144,
  endTime: 8991,
  capacity: 13309,
};

export const sampleWithFullData: IEvent = {
  id: 25593,
  name: 'crystallize essence',
  value: 'scientific from',
  activityType: 'GYM',
  minSize: 22713,
  maxSize: 7903,
  startTime: 23573,
  endTime: 18879,
  capacity: 5675,
};

export const sampleWithNewData: NewEvent = {
  name: 'hence whether throughout',
  value: 'only phew',
  activityType: 'ACADEMIC',
  minSize: 21965,
  maxSize: 5985,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
