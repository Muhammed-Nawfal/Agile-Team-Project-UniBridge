import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';
import { AchievementCategory } from 'app/entities/enumerations/achievement-category.model';

export interface IChallenge {
  id: number;
  title?: string | null;
  description?: string | null;
  category?: keyof typeof AchievementCategory | null;
  points?: number | null;
  badge?: string | null;
  badgeContentType?: string | null;
  createdDate?: dayjs.Dayjs | null;
  expiryDate?: dayjs.Dayjs | null;
  isCompleted?: boolean | null;
  completedDate?: dayjs.Dayjs | null;
  isDisplayed?: boolean | null;
  creator?: Pick<IUser, 'id'> | null;
  recipient?: Pick<IUser, 'id'> | null;
}

export type NewChallenge = Omit<IChallenge, 'id'> & { id: null };
