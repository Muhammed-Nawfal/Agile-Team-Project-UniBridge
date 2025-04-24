import dayjs from 'dayjs/esm';
import { IEvent } from 'app/entities/event/event.model';
import { AvailabilityStatus } from 'app/entities/enumerations/availability-status.model';

export interface ITimeSlot {
  id: number;
  date?: dayjs.Dayjs | null;
  startHour?: number | null;
  endHour?: number | null;
  capacity?: number | null;
  remainingCapacity?: number | null;
  status?: keyof typeof AvailabilityStatus | null;
  event?: IEvent | null;
}

export type NewTimeSlot = Omit<ITimeSlot, 'id'> & { id: null };
