import { ActivityType } from 'app/entities/enumerations/activity-type.model';

export interface IEvent {
  id: number;
  name?: string | null;
  value?: string | null;
  activityType?: keyof typeof ActivityType | null;
  minSize?: number | null;
  maxSize?: number | null;
  startTime?: number | null;
  endTime?: number | null;
  capacity?: number | null;
}

export type NewEvent = Omit<IEvent, 'id'> & { id: null };
