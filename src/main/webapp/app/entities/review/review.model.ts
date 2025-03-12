import dayjs from 'dayjs/esm';
import { IProfile } from 'app/entities/profile/profile.model';
import { IUser } from 'app/entities/user/user.model';

export interface IReview {
  id: number;
  datePublished?: dayjs.Dayjs | null;
  star?: number | null;
  text?: string | null;
  reviewsGiven?: IProfile | null;
  aboutUser?: Pick<IUser, 'id'> | null;
  fromUser?: Pick<IUser, 'id'> | null;
}

export type NewReview = Omit<IReview, 'id'> & { id: null };
