import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ITimeSlot } from '../time-slot.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../time-slot.test-samples';

import { RestTimeSlot, TimeSlotService } from './time-slot.service';

const requireRestSample: RestTimeSlot = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.format(DATE_FORMAT),
};

describe('TimeSlot Service', () => {
  let service: TimeSlotService;
  let httpMock: HttpTestingController;
  let expectedResult: ITimeSlot | ITimeSlot[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TimeSlotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a TimeSlot', () => {
      const timeSlot = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(timeSlot).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TimeSlot', () => {
      const timeSlot = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(timeSlot).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TimeSlot', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TimeSlot', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TimeSlot', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTimeSlotToCollectionIfMissing', () => {
      it('should add a TimeSlot to an empty array', () => {
        const timeSlot: ITimeSlot = sampleWithRequiredData;
        expectedResult = service.addTimeSlotToCollectionIfMissing([], timeSlot);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(timeSlot);
      });

      it('should not add a TimeSlot to an array that contains it', () => {
        const timeSlot: ITimeSlot = sampleWithRequiredData;
        const timeSlotCollection: ITimeSlot[] = [
          {
            ...timeSlot,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTimeSlotToCollectionIfMissing(timeSlotCollection, timeSlot);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TimeSlot to an array that doesn't contain it", () => {
        const timeSlot: ITimeSlot = sampleWithRequiredData;
        const timeSlotCollection: ITimeSlot[] = [sampleWithPartialData];
        expectedResult = service.addTimeSlotToCollectionIfMissing(timeSlotCollection, timeSlot);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(timeSlot);
      });

      it('should add only unique TimeSlot to an array', () => {
        const timeSlotArray: ITimeSlot[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const timeSlotCollection: ITimeSlot[] = [sampleWithRequiredData];
        expectedResult = service.addTimeSlotToCollectionIfMissing(timeSlotCollection, ...timeSlotArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const timeSlot: ITimeSlot = sampleWithRequiredData;
        const timeSlot2: ITimeSlot = sampleWithPartialData;
        expectedResult = service.addTimeSlotToCollectionIfMissing([], timeSlot, timeSlot2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(timeSlot);
        expect(expectedResult).toContain(timeSlot2);
      });

      it('should accept null and undefined values', () => {
        const timeSlot: ITimeSlot = sampleWithRequiredData;
        expectedResult = service.addTimeSlotToCollectionIfMissing([], null, timeSlot, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(timeSlot);
      });

      it('should return initial array if no TimeSlot is added', () => {
        const timeSlotCollection: ITimeSlot[] = [sampleWithRequiredData];
        expectedResult = service.addTimeSlotToCollectionIfMissing(timeSlotCollection, undefined, null);
        expect(expectedResult).toEqual(timeSlotCollection);
      });
    });

    describe('compareTimeSlot', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTimeSlot(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareTimeSlot(entity1, entity2);
        const compareResult2 = service.compareTimeSlot(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareTimeSlot(entity1, entity2);
        const compareResult2 = service.compareTimeSlot(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareTimeSlot(entity1, entity2);
        const compareResult2 = service.compareTimeSlot(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
