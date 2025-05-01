import { IRanking, NewRanking } from './ranking.model';

export const sampleWithRequiredData: IRanking = {
  id: 18939,
  reviewNumber: 31576,
  activityNumber: 4313,
  starAverage: 2.97,
  reliable: false,
};

export const sampleWithPartialData: IRanking = {
  id: 5288,
  reviewNumber: 9151,
  activityNumber: 8053,
  starAverage: 2.37,
  reliable: false,
};

export const sampleWithFullData: IRanking = {
  id: 16555,
  reviewNumber: 17882,
  activityNumber: 21142,
  starAverage: 1.04,
  reliable: false,
};

export const sampleWithNewData: NewRanking = {
  reviewNumber: 3531,
  activityNumber: 2946,
  starAverage: 3.63,
  reliable: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
