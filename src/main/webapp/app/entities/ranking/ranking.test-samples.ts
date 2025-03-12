import { IRanking, NewRanking } from './ranking.model';

export const sampleWithRequiredData: IRanking = {
  id: 3905,
  reviewNumber: 254,
  activityNumber: 321,
  starAverage: 1.5,
  reliable: 'UNRELIABLE',
};

export const sampleWithPartialData: IRanking = {
  id: 27686,
  reviewNumber: 549,
  activityNumber: 660,
  starAverage: 2,
  reliable: 'UNRELIABLE',
};

export const sampleWithFullData: IRanking = {
  id: 32553,
  reviewNumber: 211,
  activityNumber: 165,
  starAverage: 4,
  reliable: 'RELIABLE',
};

export const sampleWithNewData: NewRanking = {
  reviewNumber: 261,
  activityNumber: 253,
  starAverage: 5,
  reliable: 'RELIABLE',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
