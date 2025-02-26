import { IUser } from 'app/entities/user/user.model';
import { Reliability } from 'app/entities/enumerations/reliability.model';

export interface IRanking {
  id: number;
  reviewNumber?: number | null;
  activityNumber?: number | null;
  starAverage?: number | null;
  reliable?: keyof typeof Reliability | null;
  user?: Pick<IUser, 'id'> | null;
}

export type NewRanking = Omit<IRanking, 'id'> & { id: null };
