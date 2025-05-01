import { IProfile } from 'app/entities/profile/profile.model';

export interface IRanking {
  id: number;
  reviewNumber?: number | null;
  activityNumber?: number | null;
  starAverage?: number | null;
  reliable?: boolean | null;
  rankGiven?: IProfile | null;
}

export type NewRanking = Omit<IRanking, 'id'> & { id: null };
