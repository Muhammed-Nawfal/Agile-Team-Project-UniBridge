import { IRanking, NewRanking } from './ranking.model';

export const sampleWithRequiredData: IRanking = {
  id: 7288,
  reviewNumber: 19049,
  activityNumber: 20128,
  starAverage: 3.72,
  reliable: 'RELIABLE',
};

export const sampleWithPartialData: IRanking = {
  id: 21680,
  reviewNumber: 16973,
  activityNumber: 2387,
  starAverage: 0.54,
  reliable: 'RELIABLE',
};

export const sampleWithFullData: IRanking = {
  id: 1628,
  reviewNumber: 9814,
  activityNumber: 6145,
  starAverage: 4.09,
  reliable: 'RELIABLE',
};

export const sampleWithNewData: NewRanking = {
  reviewNumber: 31804,
  activityNumber: 7079,
  starAverage: 3.31,
  reliable: 'RELIABLE',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
