import dayjs from 'dayjs/esm';
import { IRanking } from 'app/entities/ranking/ranking.model';
import { IProfile } from 'app/entities/profile/profile.model';
import { IActivity } from 'app/entities/activity/activity.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { Decision } from 'app/entities/enumerations/decision.model';

export interface IActivityMatch {
  id: number;
  activityType?: keyof typeof ActivityType | null;
  status?: keyof typeof Decision | null;
  matchDate?: dayjs.Dayjs | null;
  matchTime?: dayjs.Dayjs | null;
  location?: string | null;
  notes?: string | null;
  createdAt?: dayjs.Dayjs | null;
  responseAt?: dayjs.Dayjs | null;
  ratings?: IRanking | null;
  matchRequestor?: IProfile | null;
  userDetails?: IProfile | null;
  matchedActivity?: IActivity | null;
}

export type NewActivityMatch = Omit<IActivityMatch, 'id'> & { id: null };
