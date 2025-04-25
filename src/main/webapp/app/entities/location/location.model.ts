import { AvailabilityStatus } from 'app/entities/enumerations/availability-status.model';

export interface ILocation {
  id: number;
  name?: string | null;
  status?: keyof typeof AvailabilityStatus | null;
  capacity?: number | null;
  remainingCapacity?: number | null;
  isCapacityBased?: boolean | null;
}

export type NewLocation = Omit<ILocation, 'id'> & { id: null };
