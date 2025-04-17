import { IProfile, NewProfile } from './profile.model';

export const sampleWithRequiredData: IProfile = {
  id: 10247,
  course: 'MATHS',
  courseYear: 3,
  university: 'ah',
};

export const sampleWithPartialData: IProfile = {
  id: 32596,
  bio: '../fake-data/blob/hipster.txt',
  course: 'MATHS',
  courseYear: 1,
  university: 'until',
  gymLocation: 'THE_GYM_SELLY_OAK',
  sports: 'BADMINTON',
  sportsTime: 'EVENING',
  preferredSociety: 'commonly impressionable charming',
  preferredEvents: 'zowie misjudge alongside',
  eventsTime: 'MORNING',
  preferredActivities: 'SPORTS',
};

export const sampleWithFullData: IProfile = {
  id: 11456,
  bio: '../fake-data/blob/hipster.txt',
  profilePicture: '../fake-data/blob/hipster.png',
  profilePictureContentType: 'unknown',
  course: 'MATHS',
  courseYear: 3,
  university: 'minor',
  gymSkill: 'NOVICE',
  gymLocation: 'THE_GYM_SELLY_OAK',
  gymTime: 'EARLY',
  studyTime: 'LATE',
  sports: 'BADMINTON',
  sportsSkill: 'CONFIDENT',
  sportsTime: 'EARLY',
  preferredSociety: 'integer curl',
  preferredEvents: 'worth',
  eventsTime: 'LATE',
  preferredActivities: 'GYM',
};

export const sampleWithNewData: NewProfile = {
  course: 'ECONOMICS',
  courseYear: 6,
  university: 'elevator keel favorable',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
