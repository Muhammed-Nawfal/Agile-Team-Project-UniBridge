import dayjs from 'dayjs/esm';
import { IFriendsList } from 'app/entities/friends-list/friends-list.model';
import { IActivityMatch } from 'app/entities/activity-match/activity-match.model';
import { IProfile } from 'app/entities/profile/profile.model';

export interface IMessageThread {
  lastMessage: string;
  id: number;
  isGroup?: boolean | null;
  name?: string | null;
  createdOn?: dayjs.Dayjs | null;
  updatedOn?: dayjs.Dayjs | null;
  friendChat?: IFriendsList | null;
  matchChat?: IActivityMatch | null;
  participants?: IProfile[] | null;
}

export type NewMessageThread = Omit<IMessageThread, 'id'> & { id: null };
