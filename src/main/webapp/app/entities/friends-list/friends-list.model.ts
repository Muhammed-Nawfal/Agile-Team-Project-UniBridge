import dayjs from 'dayjs/esm';
import { IProfile } from 'app/entities/profile/profile.model';
import { Decision } from 'app/entities/enumerations/decision.model';

export interface IFriendsList {
  id: number;
  requestTime?: dayjs.Dayjs | null;
  requestStatus?: keyof typeof Decision | null;
  friendSince?: dayjs.Dayjs | null;
  nickname?: string | null;
  requestedByProfile?: IProfile | null;
  requestedToProfile?: IProfile | null;
}

export type NewFriendsList = Omit<IFriendsList, 'id'> & { id: null };
