import { IProfile, NewProfile } from './profile.model';

export const sampleWithRequiredData: IProfile = {
  id: 1543,
  course: 'ENGLISH',
  courseYear: 1,
};

export const sampleWithPartialData: IProfile = {
  id: 31881,
  bio: '../fake-data/blob/hipster.txt',
  profilePicture: '../fake-data/blob/hipster.png',
  profilePictureContentType: 'unknown',
  course: 'ECONOMICS',
  courseYear: 2,
  gymSkill: 'PROFESSIONAL',
  gymTime: 'AFTERNOON',
  studyTime: 'EVENING',
  sportsSkill: 'PROFESSIONAL',
};

export const sampleWithFullData: IProfile = {
  id: 30283,
  bio: '../fake-data/blob/hipster.txt',
  profilePicture: '../fake-data/blob/hipster.png',
  profilePictureContentType: 'unknown',
  course: 'MATHS',
  courseYear: 2,
  gymSkill: 'NOVICE',
  gymLocation: 'PUREGYM_FIVE_WAYS',
  gymTime: 'MORNING',
  studyTime: 'AFTERNOON',
  sports: 'TENNIS',
  sportsSkill: 'NOVICE',
};

export const sampleWithNewData: NewProfile = {
  course: 'MATHS',
  courseYear: 2,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
