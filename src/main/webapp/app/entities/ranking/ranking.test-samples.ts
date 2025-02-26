import { IRanking, NewRanking } from './ranking.model';

export const sampleWithRequiredData: IRanking = {
  id: 3905,
  reviewNumber: 25400,
  activityNumber: 32193,
  starAverage: 1.69,
  reliable: 'UNRELIABLE',
};

export const sampleWithPartialData: IRanking = {
  id: 27686,
  reviewNumber: 5493,
  activityNumber: 660,
  starAverage: 2.12,
  reliable: 'RELIABLE',
};

export const sampleWithFullData: IRanking = {
  id: 32553,
  reviewNumber: 21130,
  activityNumber: 1651,
  starAverage: 3.77,
  reliable: 'UNRELIABLE',
};

export const sampleWithNewData: NewRanking = {
  reviewNumber: 26152,
  activityNumber: 25354,
  starAverage: 4.96,
  reliable: 'UNRELIABLE',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
