import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IChallenge } from '../challenge.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../challenge.test-samples';

import { ChallengeService, RestChallenge } from './challenge.service';

const requireRestSample: RestChallenge = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.format(DATE_FORMAT),
};

describe('Challenge Service', () => {
  let service: ChallengeService;
  let httpMock: HttpTestingController;
  let expectedResult: IChallenge | IChallenge[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ChallengeService);
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

    it('should create a Challenge', () => {
      const challenge = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(challenge).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Challenge', () => {
      const challenge = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(challenge).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Challenge', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Challenge', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Challenge', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addChallengeToCollectionIfMissing', () => {
      it('should add a Challenge to an empty array', () => {
        const challenge: IChallenge = sampleWithRequiredData;
        expectedResult = service.addChallengeToCollectionIfMissing([], challenge);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(challenge);
      });

      it('should not add a Challenge to an array that contains it', () => {
        const challenge: IChallenge = sampleWithRequiredData;
        const challengeCollection: IChallenge[] = [
          {
            ...challenge,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addChallengeToCollectionIfMissing(challengeCollection, challenge);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Challenge to an array that doesn't contain it", () => {
        const challenge: IChallenge = sampleWithRequiredData;
        const challengeCollection: IChallenge[] = [sampleWithPartialData];
        expectedResult = service.addChallengeToCollectionIfMissing(challengeCollection, challenge);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(challenge);
      });

      it('should add only unique Challenge to an array', () => {
        const challengeArray: IChallenge[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const challengeCollection: IChallenge[] = [sampleWithRequiredData];
        expectedResult = service.addChallengeToCollectionIfMissing(challengeCollection, ...challengeArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const challenge: IChallenge = sampleWithRequiredData;
        const challenge2: IChallenge = sampleWithPartialData;
        expectedResult = service.addChallengeToCollectionIfMissing([], challenge, challenge2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(challenge);
        expect(expectedResult).toContain(challenge2);
      });

      it('should accept null and undefined values', () => {
        const challenge: IChallenge = sampleWithRequiredData;
        expectedResult = service.addChallengeToCollectionIfMissing([], null, challenge, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(challenge);
      });

      it('should return initial array if no Challenge is added', () => {
        const challengeCollection: IChallenge[] = [sampleWithRequiredData];
        expectedResult = service.addChallengeToCollectionIfMissing(challengeCollection, undefined, null);
        expect(expectedResult).toEqual(challengeCollection);
      });
    });

    describe('compareChallenge', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareChallenge(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareChallenge(entity1, entity2);
        const compareResult2 = service.compareChallenge(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareChallenge(entity1, entity2);
        const compareResult2 = service.compareChallenge(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareChallenge(entity1, entity2);
        const compareResult2 = service.compareChallenge(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
