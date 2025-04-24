import { IProfile, NewProfile } from './profile.model';

export const sampleWithRequiredData: IProfile = {
  id: 26037,
  login: 'jacket',
  firstName: 'Janiya',
  lastName: 'Corwin',
  course: 'ART',
  courseYear: 6,
};

export const sampleWithPartialData: IProfile = {
  id: 1865,
  login: 'on sophisticated',
  firstName: 'Bettye',
  lastName: 'Kozey',
  profilePicture: '../fake-data/blob/hipster.png',
  profilePictureContentType: 'unknown',
  course: 'SOCIOLOGY',
  courseYear: 1,
  gymSkill: 'PROFESSIONAL',
  gymLocation: 'THE_GYM_SELLY_OAK',
  studyTime: 'LATE_NIGHT',
  sports: 'CYCLING',
  sportsSkill: 'INTERMEDIATE',
  preferredSociety: 'ISLAMIC',
  preferredEvents: 'SPORTS_NIGHT',
};

export const sampleWithFullData: IProfile = {
  id: 26914,
  login: 'atop incidentally whether',
  firstName: 'Jed',
  lastName: 'Strosin',
  bio: '../fake-data/blob/hipster.txt',
  profilePicture: '../fake-data/blob/hipster.png',
  profilePictureContentType: 'unknown',
  course: 'PSYCHOLOGY',
  courseYear: 1,
  university: 'UNIVERSITY_OF_NOTTINGHAM',
  gymSkill: 'NOVICE',
  gymLocation: 'THE_GYM_SELLY_OAK',
  gymTime: 'EARLY_MORNING',
  studyTime: 'MORNING',
  sports: 'SKATEBOARDING',
  sportsSkill: 'INTERMEDIATE',
  sportsTime: 'LATE_NIGHT',
  preferredSociety: 'FINTECH',
  preferredEvents: 'GAMES_NIGHT',
  eventsTime: 'AFTERNOON',
  preferredActivities: 'OTHER',
};

export const sampleWithNewData: NewProfile = {
  login: 'geez dearly',
  firstName: 'Jesus',
  lastName: 'Gerhold',
  course: 'ECONOMICS',
  courseYear: 6,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
