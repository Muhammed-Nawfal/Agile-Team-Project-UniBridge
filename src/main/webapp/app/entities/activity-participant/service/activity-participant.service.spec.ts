import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IActivityParticipant } from '../activity-participant.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../activity-participant.test-samples';

import { ActivityParticipantService, RestActivityParticipant } from './activity-participant.service';

const requireRestSample: RestActivityParticipant = {
  ...sampleWithRequiredData,
  joinedDate: sampleWithRequiredData.joinedDate?.toJSON(),
};

describe('ActivityParticipant Service', () => {
  let service: ActivityParticipantService;
  let httpMock: HttpTestingController;
  let expectedResult: IActivityParticipant | IActivityParticipant[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ActivityParticipantService);
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

    it('should create a ActivityParticipant', () => {
      const activityParticipant = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(activityParticipant).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ActivityParticipant', () => {
      const activityParticipant = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(activityParticipant).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ActivityParticipant', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ActivityParticipant', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ActivityParticipant', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addActivityParticipantToCollectionIfMissing', () => {
      it('should add a ActivityParticipant to an empty array', () => {
        const activityParticipant: IActivityParticipant = sampleWithRequiredData;
        expectedResult = service.addActivityParticipantToCollectionIfMissing([], activityParticipant);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(activityParticipant);
      });

      it('should not add a ActivityParticipant to an array that contains it', () => {
        const activityParticipant: IActivityParticipant = sampleWithRequiredData;
        const activityParticipantCollection: IActivityParticipant[] = [
          {
            ...activityParticipant,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addActivityParticipantToCollectionIfMissing(activityParticipantCollection, activityParticipant);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ActivityParticipant to an array that doesn't contain it", () => {
        const activityParticipant: IActivityParticipant = sampleWithRequiredData;
        const activityParticipantCollection: IActivityParticipant[] = [sampleWithPartialData];
        expectedResult = service.addActivityParticipantToCollectionIfMissing(activityParticipantCollection, activityParticipant);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(activityParticipant);
      });

      it('should add only unique ActivityParticipant to an array', () => {
        const activityParticipantArray: IActivityParticipant[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const activityParticipantCollection: IActivityParticipant[] = [sampleWithRequiredData];
        expectedResult = service.addActivityParticipantToCollectionIfMissing(activityParticipantCollection, ...activityParticipantArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const activityParticipant: IActivityParticipant = sampleWithRequiredData;
        const activityParticipant2: IActivityParticipant = sampleWithPartialData;
        expectedResult = service.addActivityParticipantToCollectionIfMissing([], activityParticipant, activityParticipant2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(activityParticipant);
        expect(expectedResult).toContain(activityParticipant2);
      });

      it('should accept null and undefined values', () => {
        const activityParticipant: IActivityParticipant = sampleWithRequiredData;
        expectedResult = service.addActivityParticipantToCollectionIfMissing([], null, activityParticipant, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(activityParticipant);
      });

      it('should return initial array if no ActivityParticipant is added', () => {
        const activityParticipantCollection: IActivityParticipant[] = [sampleWithRequiredData];
        expectedResult = service.addActivityParticipantToCollectionIfMissing(activityParticipantCollection, undefined, null);
        expect(expectedResult).toEqual(activityParticipantCollection);
      });
    });

    describe('compareActivityParticipant', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareActivityParticipant(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareActivityParticipant(entity1, entity2);
        const compareResult2 = service.compareActivityParticipant(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareActivityParticipant(entity1, entity2);
        const compareResult2 = service.compareActivityParticipant(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareActivityParticipant(entity1, entity2);
        const compareResult2 = service.compareActivityParticipant(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
