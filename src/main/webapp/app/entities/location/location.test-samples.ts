import { ILocation, NewLocation } from './location.model';

export const sampleWithRequiredData: ILocation = {
  id: 8430,
  name: 'inasmuch kookily informal',
  status: 'MAINTENANCE',
  capacity: 11479,
  isCapacityBased: true,
};

export const sampleWithPartialData: ILocation = {
  id: 9071,
  name: 'bruised tremendously',
  status: 'OCCUPIED',
  capacity: 10813,
  remainingCapacity: 30667,
  isCapacityBased: false,
};

export const sampleWithFullData: ILocation = {
  id: 11295,
  name: 'gleefully afore',
  status: 'AVAILABLE',
  capacity: 11729,
  remainingCapacity: 915,
  isCapacityBased: false,
};

export const sampleWithNewData: NewLocation = {
  name: 'phooey',
  status: 'MAINTENANCE',
  capacity: 19173,
  isCapacityBased: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
