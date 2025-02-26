import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';
import { Notificationstype } from 'app/entities/enumerations/notificationstype.model';

export interface INotification {
  id: number;
  notificationType?: keyof typeof Notificationstype | null;
  title?: string | null;
  message?: string | null;
  timestamp?: dayjs.Dayjs | null;
  isRead?: boolean | null;
  userID?: Pick<IUser, 'id'> | null;
}

export type NewNotification = Omit<INotification, 'id'> & { id: null };
