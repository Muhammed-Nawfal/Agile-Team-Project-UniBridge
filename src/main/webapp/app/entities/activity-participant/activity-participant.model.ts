import dayjs from 'dayjs/esm';
import { IProfile } from 'app/entities/profile/profile.model';
import { IActivity } from 'app/entities/activity/activity.model';
import { ParticipationStatus } from 'app/entities/enumerations/participation-status.model';

export interface IActivityParticipant {
  id: number;
  joinedDate?: dayjs.Dayjs | null;
  status?: keyof typeof ParticipationStatus | null;
  participant?: IProfile | null;
  activity?: IActivity | null;
}

export type NewActivityParticipant = Omit<IActivityParticipant, 'id'> & { id: null };
