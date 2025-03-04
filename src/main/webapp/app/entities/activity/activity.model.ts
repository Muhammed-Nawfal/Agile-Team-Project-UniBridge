import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { Status } from 'app/entities/enumerations/status.model';
import { IsPaid } from 'app/entities/enumerations/is-paid.model';

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
  paid?: keyof typeof IsPaid | null;
  costOfactivity?: number | null;
  requesteduser?: Pick<IUser, 'id'> | null;
}

export type NewActivity = Omit<IActivity, 'id'> & { id: null };
