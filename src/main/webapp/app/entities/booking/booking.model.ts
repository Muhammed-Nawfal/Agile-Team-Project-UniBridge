import dayjs from 'dayjs/esm';
import { ITimeSlot } from 'app/entities/time-slot/time-slot.model';
import { IActivity } from 'app/entities/activity/activity.model';
import { ILocation } from 'app/entities/location/location.model';
import { IProfile } from 'app/entities/profile/profile.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { EventType } from 'app/entities/enumerations/event-type.model';
import { BookingStatus } from 'app/entities/enumerations/booking-status.model';

export interface IBooking {
  id: number;
  activityType?: keyof typeof ActivityType | null;
  eventType?: keyof typeof EventType | null;
  bookingDate?: dayjs.Dayjs | null;
  partySize?: number | null;
  bookingStatus?: keyof typeof BookingStatus | null;
  createdAt?: dayjs.Dayjs | null;
  assignedAt?: dayjs.Dayjs | null;
  timeSlots?: ITimeSlot | null;
  bookedActivity?: IActivity | null;
  bookingLocation?: ILocation | null;
  creator?: IProfile | null;
  activity?: IActivity | null;
  timeSlot?: ITimeSlot | null;
}

export type NewBooking = Omit<IBooking, 'id'> & { id: null };
