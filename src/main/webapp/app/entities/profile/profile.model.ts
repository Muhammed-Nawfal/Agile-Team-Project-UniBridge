import { IUser } from 'app/entities/user/user.model';
import { IMessageThread } from 'app/entities/message-thread/message-thread.model';
import { Course } from 'app/entities/enumerations/course.model';
import { University } from 'app/entities/enumerations/university.model';
import { Skill } from 'app/entities/enumerations/skill.model';
import { GymLocation } from 'app/entities/enumerations/gym-location.model';
import { PreferredTime } from 'app/entities/enumerations/preferred-time.model';
import { Sports } from 'app/entities/enumerations/sports.model';
import { Society } from 'app/entities/enumerations/society.model';
import { PreferredEvents } from 'app/entities/enumerations/preferred-events.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';

export interface IProfile {
  id: number;
  login?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profilePicture?: string | null;
  profilePictureContentType?: string | null;
  course?: keyof typeof Course | null;
  courseYear?: number | null;
  university?: keyof typeof University | null;
  gymSkill?: keyof typeof Skill | null;
  gymLocation?: keyof typeof GymLocation | null;
  gymTime?: keyof typeof PreferredTime | null;
  studyTime?: keyof typeof PreferredTime | null;
  sports?: keyof typeof Sports | null;
  sportsSkill?: keyof typeof Skill | null;
  sportsTime?: keyof typeof PreferredTime | null;
  preferredSociety?: keyof typeof Society | null;
  preferredEvents?: keyof typeof PreferredEvents | null;
  eventsTime?: keyof typeof PreferredTime | null;
  preferredActivities?: keyof typeof ActivityType | null;
  user?: Pick<IUser, 'id'> | null;
  messageThreads?: IMessageThread[] | null;
}

export type NewProfile = Omit<IProfile, 'id'> & { id: null };
