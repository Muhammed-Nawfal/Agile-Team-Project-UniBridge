import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IRanking } from '../ranking.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../ranking.test-samples';

import { RankingService } from './ranking.service';

const requireRestSample: IRanking = {
  ...sampleWithRequiredData,
};

describe('Ranking Service', () => {
  let service: RankingService;
  let httpMock: HttpTestingController;
  let expectedResult: IRanking | IRanking[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(RankingService);
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

    it('should create a Ranking', () => {
      const ranking = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(ranking).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Ranking', () => {
      const ranking = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(ranking).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Ranking', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Ranking', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Ranking', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addRankingToCollectionIfMissing', () => {
      it('should add a Ranking to an empty array', () => {
        const ranking: IRanking = sampleWithRequiredData;
        expectedResult = service.addRankingToCollectionIfMissing([], ranking);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(ranking);
      });

      it('should not add a Ranking to an array that contains it', () => {
        const ranking: IRanking = sampleWithRequiredData;
        const rankingCollection: IRanking[] = [
          {
            ...ranking,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addRankingToCollectionIfMissing(rankingCollection, ranking);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Ranking to an array that doesn't contain it", () => {
        const ranking: IRanking = sampleWithRequiredData;
        const rankingCollection: IRanking[] = [sampleWithPartialData];
        expectedResult = service.addRankingToCollectionIfMissing(rankingCollection, ranking);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(ranking);
      });

      it('should add only unique Ranking to an array', () => {
        const rankingArray: IRanking[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const rankingCollection: IRanking[] = [sampleWithRequiredData];
        expectedResult = service.addRankingToCollectionIfMissing(rankingCollection, ...rankingArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const ranking: IRanking = sampleWithRequiredData;
        const ranking2: IRanking = sampleWithPartialData;
        expectedResult = service.addRankingToCollectionIfMissing([], ranking, ranking2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(ranking);
        expect(expectedResult).toContain(ranking2);
      });

      it('should accept null and undefined values', () => {
        const ranking: IRanking = sampleWithRequiredData;
        expectedResult = service.addRankingToCollectionIfMissing([], null, ranking, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(ranking);
      });

      it('should return initial array if no Ranking is added', () => {
        const rankingCollection: IRanking[] = [sampleWithRequiredData];
        expectedResult = service.addRankingToCollectionIfMissing(rankingCollection, undefined, null);
        expect(expectedResult).toEqual(rankingCollection);
      });
    });

    describe('compareRanking', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareRanking(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareRanking(entity1, entity2);
        const compareResult2 = service.compareRanking(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareRanking(entity1, entity2);
        const compareResult2 = service.compareRanking(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareRanking(entity1, entity2);
        const compareResult2 = service.compareRanking(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
