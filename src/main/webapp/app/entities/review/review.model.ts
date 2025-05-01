import dayjs from 'dayjs/esm';
import { IProfile } from 'app/entities/profile/profile.model';

export interface IReview {
  id: number;
  datePublished?: dayjs.Dayjs | null;
  star?: number | null;
  text?: string | null;
  aboutUser?: IProfile | null;
  fromUser?: IProfile | null;
}

export type NewReview = Omit<IReview, 'id'> & { id: null };
