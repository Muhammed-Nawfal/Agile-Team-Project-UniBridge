import dayjs from 'dayjs/esm';
import { IProfile } from 'app/entities/profile/profile.model';
import { IUser } from 'app/entities/user/user.model';
import { Decision } from 'app/entities/enumerations/decision.model';

export interface IFriendsList {
  id: number;
  friendRequest?: keyof typeof Decision | null;
  friendSince?: dayjs.Dayjs | null;
  friends?: IProfile | null;
  user?: Pick<IUser, 'id'> | null;
  friend?: Pick<IUser, 'id'> | null;
}

export type NewFriendsList = Omit<IFriendsList, 'id'> & { id: null };
