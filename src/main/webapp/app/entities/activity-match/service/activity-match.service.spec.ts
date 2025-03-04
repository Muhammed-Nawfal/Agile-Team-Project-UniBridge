import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IActivityMatch } from '../activity-match.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../activity-match.test-samples';

import { ActivityMatchService } from './activity-match.service';

const requireRestSample: IActivityMatch = {
  ...sampleWithRequiredData,
};

describe('ActivityMatch Service', () => {
  let service: ActivityMatchService;
  let httpMock: HttpTestingController;
  let expectedResult: IActivityMatch | IActivityMatch[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ActivityMatchService);
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

    it('should create a ActivityMatch', () => {
      const activityMatch = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(activityMatch).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ActivityMatch', () => {
      const activityMatch = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(activityMatch).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ActivityMatch', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ActivityMatch', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ActivityMatch', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addActivityMatchToCollectionIfMissing', () => {
      it('should add a ActivityMatch to an empty array', () => {
        const activityMatch: IActivityMatch = sampleWithRequiredData;
        expectedResult = service.addActivityMatchToCollectionIfMissing([], activityMatch);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(activityMatch);
      });

      it('should not add a ActivityMatch to an array that contains it', () => {
        const activityMatch: IActivityMatch = sampleWithRequiredData;
        const activityMatchCollection: IActivityMatch[] = [
          {
            ...activityMatch,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addActivityMatchToCollectionIfMissing(activityMatchCollection, activityMatch);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ActivityMatch to an array that doesn't contain it", () => {
        const activityMatch: IActivityMatch = sampleWithRequiredData;
        const activityMatchCollection: IActivityMatch[] = [sampleWithPartialData];
        expectedResult = service.addActivityMatchToCollectionIfMissing(activityMatchCollection, activityMatch);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(activityMatch);
      });

      it('should add only unique ActivityMatch to an array', () => {
        const activityMatchArray: IActivityMatch[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const activityMatchCollection: IActivityMatch[] = [sampleWithRequiredData];
        expectedResult = service.addActivityMatchToCollectionIfMissing(activityMatchCollection, ...activityMatchArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const activityMatch: IActivityMatch = sampleWithRequiredData;
        const activityMatch2: IActivityMatch = sampleWithPartialData;
        expectedResult = service.addActivityMatchToCollectionIfMissing([], activityMatch, activityMatch2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(activityMatch);
        expect(expectedResult).toContain(activityMatch2);
      });

      it('should accept null and undefined values', () => {
        const activityMatch: IActivityMatch = sampleWithRequiredData;
        expectedResult = service.addActivityMatchToCollectionIfMissing([], null, activityMatch, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(activityMatch);
      });

      it('should return initial array if no ActivityMatch is added', () => {
        const activityMatchCollection: IActivityMatch[] = [sampleWithRequiredData];
        expectedResult = service.addActivityMatchToCollectionIfMissing(activityMatchCollection, undefined, null);
        expect(expectedResult).toEqual(activityMatchCollection);
      });
    });

    describe('compareActivityMatch', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareActivityMatch(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareActivityMatch(entity1, entity2);
        const compareResult2 = service.compareActivityMatch(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareActivityMatch(entity1, entity2);
        const compareResult2 = service.compareActivityMatch(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareActivityMatch(entity1, entity2);
        const compareResult2 = service.compareActivityMatch(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
