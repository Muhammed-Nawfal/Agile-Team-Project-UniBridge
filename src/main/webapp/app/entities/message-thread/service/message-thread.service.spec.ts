import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IMessageThread } from '../message-thread.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../message-thread.test-samples';

import { MessageThreadService, RestMessageThread } from './message-thread.service';

const requireRestSample: RestMessageThread = {
  ...sampleWithRequiredData,
  createdOn: sampleWithRequiredData.createdOn?.toJSON(),
  updatedOn: sampleWithRequiredData.updatedOn?.toJSON(),
};

describe('MessageThread Service', () => {
  let service: MessageThreadService;
  let httpMock: HttpTestingController;
  let expectedResult: IMessageThread | IMessageThread[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(MessageThreadService);
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

    it('should create a MessageThread', () => {
      const messageThread = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(messageThread).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a MessageThread', () => {
      const messageThread = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(messageThread).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a MessageThread', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of MessageThread', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a MessageThread', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addMessageThreadToCollectionIfMissing', () => {
      it('should add a MessageThread to an empty array', () => {
        const messageThread: IMessageThread = sampleWithRequiredData;
        expectedResult = service.addMessageThreadToCollectionIfMissing([], messageThread);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(messageThread);
      });

      it('should not add a MessageThread to an array that contains it', () => {
        const messageThread: IMessageThread = sampleWithRequiredData;
        const messageThreadCollection: IMessageThread[] = [
          {
            ...messageThread,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addMessageThreadToCollectionIfMissing(messageThreadCollection, messageThread);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a MessageThread to an array that doesn't contain it", () => {
        const messageThread: IMessageThread = sampleWithRequiredData;
        const messageThreadCollection: IMessageThread[] = [sampleWithPartialData];
        expectedResult = service.addMessageThreadToCollectionIfMissing(messageThreadCollection, messageThread);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(messageThread);
      });

      it('should add only unique MessageThread to an array', () => {
        const messageThreadArray: IMessageThread[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const messageThreadCollection: IMessageThread[] = [sampleWithRequiredData];
        expectedResult = service.addMessageThreadToCollectionIfMissing(messageThreadCollection, ...messageThreadArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const messageThread: IMessageThread = sampleWithRequiredData;
        const messageThread2: IMessageThread = sampleWithPartialData;
        expectedResult = service.addMessageThreadToCollectionIfMissing([], messageThread, messageThread2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(messageThread);
        expect(expectedResult).toContain(messageThread2);
      });

      it('should accept null and undefined values', () => {
        const messageThread: IMessageThread = sampleWithRequiredData;
        expectedResult = service.addMessageThreadToCollectionIfMissing([], null, messageThread, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(messageThread);
      });

      it('should return initial array if no MessageThread is added', () => {
        const messageThreadCollection: IMessageThread[] = [sampleWithRequiredData];
        expectedResult = service.addMessageThreadToCollectionIfMissing(messageThreadCollection, undefined, null);
        expect(expectedResult).toEqual(messageThreadCollection);
      });
    });

    describe('compareMessageThread', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareMessageThread(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareMessageThread(entity1, entity2);
        const compareResult2 = service.compareMessageThread(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareMessageThread(entity1, entity2);
        const compareResult2 = service.compareMessageThread(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareMessageThread(entity1, entity2);
        const compareResult2 = service.compareMessageThread(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
