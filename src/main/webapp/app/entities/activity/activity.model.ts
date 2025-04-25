import dayjs from 'dayjs/esm';
import { IProfile } from 'app/entities/profile/profile.model';
import { IChallenge } from 'app/entities/challenge/challenge.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { Status } from 'app/entities/enumerations/status.model';

export interface IActivity {
  id: number;
  activityName?: string | null;
  activityType?: keyof typeof ActivityType | null;
  activityDate?: dayjs.Dayjs | null;
  numberOfParticipants?: number | null;
  maxNumberOfParticipants?: number | null;
  location?: string | null;
  description?: string | null;
  createdOn?: dayjs.Dayjs | null;
  updatedOn?: dayjs.Dayjs | null;
  status?: keyof typeof Status | null;
  coverImage?: string | null;
  coverImageContentType?: string | null;
  isPaid?: boolean | null;
  activityCost?: number | null;
  creator?: IProfile | null;
  challenge?: IChallenge | null;
}

export type NewActivity = Omit<IActivity, 'id'> & { id: null };
