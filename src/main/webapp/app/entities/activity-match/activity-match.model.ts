import { IProfile } from 'app/entities/profile/profile.model';
import { IUser } from 'app/entities/user/user.model';
import { IActivity } from 'app/entities/activity/activity.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { Decision } from 'app/entities/enumerations/decision.model';

export interface IActivityMatch {
  id: number;
  activityType?: keyof typeof ActivityType | null;
  status?: keyof typeof Decision | null;
  userName?: IProfile | null;
  requestUser?: Pick<IUser, 'id'> | null;
  matchedUser?: Pick<IUser, 'id'> | null;
  matchedActivity?: IActivity | null;
}

export type NewActivityMatch = Omit<IActivityMatch, 'id'> & { id: null };

export enum ActivityTypeMapping {
  gym = 'SOCIAL',
  study = 'ACADEMIC',
  sports = 'SPORTS',
  events = 'OTHER',
}
