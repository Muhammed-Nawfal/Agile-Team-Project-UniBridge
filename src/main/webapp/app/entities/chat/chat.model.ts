import dayjs from 'dayjs/esm';
import { IFriendsList } from 'app/entities/friends-list/friends-list.model';
import { IProfile } from 'app/entities/profile/profile.model';
import { IUser } from 'app/entities/user/user.model';
import { ActionType } from 'app/entities/enumerations/action-type.model';

export interface IChat {
  id: number;
  message?: string | null;
  timestamp?: dayjs.Dayjs | null;
  type?: keyof typeof ActionType | null;
  friendChat?: IFriendsList | null;
  chats?: IProfile | null;
  sender?: Pick<IUser, 'id'> | null;
  receiver?: Pick<IUser, 'id'> | null;
}

export type NewChat = Omit<IChat, 'id'> & { id: null };
