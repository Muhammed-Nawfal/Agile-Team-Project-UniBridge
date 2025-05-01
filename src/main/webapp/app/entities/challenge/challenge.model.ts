import dayjs from 'dayjs/esm';
import { IProfile } from 'app/entities/profile/profile.model';
import { Category } from 'app/entities/enumerations/category.model';

export interface IChallenge {
  id: number;
  title?: string | null;
  description?: string | null;
  category?: keyof typeof Category | null;
  date?: dayjs.Dayjs | null;
  points?: number | null;
  badge?: string | null;
  badgeContentType?: string | null;
  completed?: boolean | null;
  assignedTo?: IProfile | null;
  createdBy?: IProfile | null;
}

export type NewChallenge = Omit<IChallenge, 'id'> & { id: null };
