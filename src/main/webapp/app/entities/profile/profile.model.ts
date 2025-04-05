import { IUser } from 'app/entities/user/user.model';
import { Course } from 'app/entities/enumerations/course.model';
import { Skill } from 'app/entities/enumerations/skill.model';
import { GymLocation } from 'app/entities/enumerations/gym-location.model';
import { PreferredTime } from 'app/entities/enumerations/preferred-time.model';
import { Sports } from 'app/entities/enumerations/sports.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';

export interface IProfile {
  id: number;
  bio?: string | null;
  profilePicture?: string | null;
  profilePictureContentType?: string | null;
  course?: keyof typeof Course | null;
  courseYear?: number | null;
  university?: string | null;
  gymSkill?: keyof typeof Skill | null;
  gymLocation?: keyof typeof GymLocation | null;
  gymTime?: keyof typeof PreferredTime | null;
  studyTime?: keyof typeof PreferredTime | null;
  sports?: keyof typeof Sports | null;
  sportsSkill?: keyof typeof Skill | null;
  sportsTime?: keyof typeof PreferredTime | null;
  preferredSociety?: string | null;
  preferredEvents?: string | null;
  eventsTime?: keyof typeof PreferredTime | null;
  preferredActivities?: keyof typeof ActivityType | null;
  user?: Pick<IUser, 'id' | 'firstName'> | null;
  userFirstName?: string;
}

export type NewProfile = Omit<IProfile, 'id'> & { id: null };
