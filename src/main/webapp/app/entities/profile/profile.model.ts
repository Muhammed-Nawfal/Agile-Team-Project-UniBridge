import { IUser } from 'app/entities/user/user.model';
import { Course } from 'app/entities/enumerations/course.model';
import { Skill } from 'app/entities/enumerations/skill.model';
import { GymLocation } from 'app/entities/enumerations/gym-location.model';
import { PreferredTime } from 'app/entities/enumerations/preferred-time.model';
import { Sports } from 'app/entities/enumerations/sports.model';

export interface IProfile {
  id: number;
  bio?: string | null;
  profilePicture?: string | null;
  profilePictureContentType?: string | null;
  course?: keyof typeof Course | null;
  courseYear?: number | null;
  gymSkill?: keyof typeof Skill | null;
  gymLocation?: keyof typeof GymLocation | null;
  gymTime?: keyof typeof PreferredTime | null;
  studyTime?: keyof typeof PreferredTime | null;
  sports?: keyof typeof Sports | null;
  sportsSkill?: keyof typeof Skill | null;
  user?: IUser;
}

export type NewProfile = Omit<IProfile, 'id'> & { id: null };
