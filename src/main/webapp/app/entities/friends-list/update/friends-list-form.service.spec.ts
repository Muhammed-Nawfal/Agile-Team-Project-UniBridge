import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../friends-list.test-samples';

import { FriendsListFormService } from './friends-list-form.service';

describe('FriendsList Form Service', () => {
  let service: FriendsListFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendsListFormService);
  });

  describe('Service methods', () => {
    describe('createFriendsListFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createFriendsListFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            friendRequest: expect.any(Object),
            friendSince: expect.any(Object),
            user: expect.any(Object),
            friend: expect.any(Object),
          }),
        );
      });

      it('passing IFriendsList should create a new form with FormGroup', () => {
        const formGroup = service.createFriendsListFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            friendRequest: expect.any(Object),
            friendSince: expect.any(Object),
            user: expect.any(Object),
            friend: expect.any(Object),
          }),
        );
      });
    });

    describe('getFriendsList', () => {
      it('should return NewFriendsList for default FriendsList initial value', () => {
        const formGroup = service.createFriendsListFormGroup(sampleWithNewData);

        const friendsList = service.getFriendsList(formGroup) as any;

        expect(friendsList).toMatchObject(sampleWithNewData);
      });

      it('should return NewFriendsList for empty FriendsList initial value', () => {
        const formGroup = service.createFriendsListFormGroup();

        const friendsList = service.getFriendsList(formGroup) as any;

        expect(friendsList).toMatchObject({});
      });

      it('should return IFriendsList', () => {
        const formGroup = service.createFriendsListFormGroup(sampleWithRequiredData);

        const friendsList = service.getFriendsList(formGroup) as any;

        expect(friendsList).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IFriendsList should not enable id FormControl', () => {
        const formGroup = service.createFriendsListFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewFriendsList should disable id FormControl', () => {
        const formGroup = service.createFriendsListFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
