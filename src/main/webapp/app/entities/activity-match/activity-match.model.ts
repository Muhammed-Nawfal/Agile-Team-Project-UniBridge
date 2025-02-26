import { IUser } from 'app/entities/user/user.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { Decision } from 'app/entities/enumerations/decision.model';

export interface IActivityMatch {
  id: number;
  activityType?: keyof typeof ActivityType | null;
  status?: keyof typeof Decision | null;
  requestUser?: Pick<IUser, 'id'> | null;
  matchedUser?: Pick<IUser, 'id'> | null;
}

export type NewActivityMatch = Omit<IActivityMatch, 'id'> & { id: null };
