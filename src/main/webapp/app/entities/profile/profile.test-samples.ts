import { IProfile, NewProfile } from './profile.model';

export const sampleWithRequiredData: IProfile = {
  id: 977,
  course: 'ENGLISH',
  courseYear: 5,
};

export const sampleWithPartialData: IProfile = {
  id: 2686,
  bio: '../fake-data/blob/hipster.txt',
  profilePicture: '../fake-data/blob/hipster.png',
  profilePictureContentType: 'unknown',
  course: 'ECONOMICS',
  courseYear: 2,
  gymLocation: 'THE_GYM_SELLY_OAK',
  studyTime: 'EARLY',
  sports: 'CRICKET',
  sportsSkill: 'NOVICE',
};

export const sampleWithFullData: IProfile = {
  id: 32284,
  bio: '../fake-data/blob/hipster.txt',
  profilePicture: '../fake-data/blob/hipster.png',
  profilePictureContentType: 'unknown',
  course: 'ENGLISH',
  courseYear: 3,
  gymSkill: 'CONFIDENT',
  gymLocation: 'PUREGYM_FIVE_WAYS',
  gymTime: 'AFTERNOON',
  studyTime: 'LATE',
  sports: 'FOOTBALL',
  sportsSkill: 'INTERMEDIATE',
};

export const sampleWithNewData: NewProfile = {
  course: 'ECONOMICS',
  courseYear: 1,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
