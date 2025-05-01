import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IFriendsList } from '../friends-list.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../friends-list.test-samples';

import { FriendsListService, RestFriendsList } from './friends-list.service';

const requireRestSample: RestFriendsList = {
  ...sampleWithRequiredData,
  requestTime: sampleWithRequiredData.requestTime?.toJSON(),
  friendSince: sampleWithRequiredData.friendSince?.toJSON(),
};

describe('FriendsList Service', () => {
  let service: FriendsListService;
  let httpMock: HttpTestingController;
  let expectedResult: IFriendsList | IFriendsList[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(FriendsListService);
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

    it('should create a FriendsList', () => {
      const friendsList = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(friendsList).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a FriendsList', () => {
      const friendsList = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(friendsList).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a FriendsList', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of FriendsList', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a FriendsList', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addFriendsListToCollectionIfMissing', () => {
      it('should add a FriendsList to an empty array', () => {
        const friendsList: IFriendsList = sampleWithRequiredData;
        expectedResult = service.addFriendsListToCollectionIfMissing([], friendsList);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(friendsList);
      });

      it('should not add a FriendsList to an array that contains it', () => {
        const friendsList: IFriendsList = sampleWithRequiredData;
        const friendsListCollection: IFriendsList[] = [
          {
            ...friendsList,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFriendsListToCollectionIfMissing(friendsListCollection, friendsList);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a FriendsList to an array that doesn't contain it", () => {
        const friendsList: IFriendsList = sampleWithRequiredData;
        const friendsListCollection: IFriendsList[] = [sampleWithPartialData];
        expectedResult = service.addFriendsListToCollectionIfMissing(friendsListCollection, friendsList);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(friendsList);
      });

      it('should add only unique FriendsList to an array', () => {
        const friendsListArray: IFriendsList[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const friendsListCollection: IFriendsList[] = [sampleWithRequiredData];
        expectedResult = service.addFriendsListToCollectionIfMissing(friendsListCollection, ...friendsListArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const friendsList: IFriendsList = sampleWithRequiredData;
        const friendsList2: IFriendsList = sampleWithPartialData;
        expectedResult = service.addFriendsListToCollectionIfMissing([], friendsList, friendsList2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(friendsList);
        expect(expectedResult).toContain(friendsList2);
      });

      it('should accept null and undefined values', () => {
        const friendsList: IFriendsList = sampleWithRequiredData;
        expectedResult = service.addFriendsListToCollectionIfMissing([], null, friendsList, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(friendsList);
      });

      it('should return initial array if no FriendsList is added', () => {
        const friendsListCollection: IFriendsList[] = [sampleWithRequiredData];
        expectedResult = service.addFriendsListToCollectionIfMissing(friendsListCollection, undefined, null);
        expect(expectedResult).toEqual(friendsListCollection);
      });
    });

    describe('compareFriendsList', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFriendsList(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareFriendsList(entity1, entity2);
        const compareResult2 = service.compareFriendsList(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareFriendsList(entity1, entity2);
        const compareResult2 = service.compareFriendsList(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareFriendsList(entity1, entity2);
        const compareResult2 = service.compareFriendsList(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
