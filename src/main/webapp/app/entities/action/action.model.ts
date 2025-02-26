import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';
import { ActionType } from 'app/entities/enumerations/action-type.model';

export interface IAction {
  id: number;
  type?: keyof typeof ActionType | null;
  timestamp?: dayjs.Dayjs | null;
  performedByID?: Pick<IUser, 'id'> | null;
  targetUserID?: Pick<IUser, 'id'> | null;
}

export type NewAction = Omit<IAction, 'id'> & { id: null };
