import dayjs from 'dayjs/esm';

import { ITimeSlot, NewTimeSlot } from './time-slot.model';

export const sampleWithRequiredData: ITimeSlot = {
  id: 10082,
  date: dayjs('2025-04-23'),
  startHour: 7369,
  endHour: 15643,
  capacity: 10484,
  status: 'FULL',
};

export const sampleWithPartialData: ITimeSlot = {
  id: 9659,
  date: dayjs('2025-04-23'),
  startHour: 27090,
  endHour: 32427,
  capacity: 16410,
  status: 'OCCUPIED',
};

export const sampleWithFullData: ITimeSlot = {
  id: 31157,
  date: dayjs('2025-04-23'),
  startHour: 17412,
  endHour: 30841,
  capacity: 16565,
  remainingCapacity: 22413,
  status: 'BLOCKED',
};

export const sampleWithNewData: NewTimeSlot = {
  date: dayjs('2025-04-24'),
  startHour: 27477,
  endHour: 18269,
  capacity: 6701,
  status: 'OCCUPIED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
