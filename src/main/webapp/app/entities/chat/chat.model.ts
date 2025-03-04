import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';

export interface IChat {
  id: number;
  message?: string | null;
  timestamp?: dayjs.Dayjs | null;
  senderID?: Pick<IUser, 'id'> | null;
  recieverID?: Pick<IUser, 'id'> | null;
}

export type NewChat = Omit<IChat, 'id'> & { id: null };
