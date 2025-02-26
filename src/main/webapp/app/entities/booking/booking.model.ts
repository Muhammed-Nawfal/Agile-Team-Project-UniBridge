import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';
import { IActivity } from 'app/entities/activity/activity.model';
import { Status } from 'app/entities/enumerations/status.model';
import { BookingType } from 'app/entities/enumerations/booking-type.model';

export interface IBooking {
  id: number;
  bookingName?: string | null;
  bookingStatus?: keyof typeof Status | null;
  bookingTime?: dayjs.Dayjs | null;
  bookingDate?: dayjs.Dayjs | null;
  phoneNum?: string | null;
  bookingType?: keyof typeof BookingType | null;
  numOfParticipants?: number | null;
  bookStartTime?: dayjs.Dayjs | null;
  bookEndTime?: dayjs.Dayjs | null;
  requestedUser?: Pick<IUser, 'id'> | null;
  activity?: IActivity | null;
}

export type NewBooking = Omit<IBooking, 'id'> & { id: null };
