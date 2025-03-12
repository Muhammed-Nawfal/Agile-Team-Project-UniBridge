import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IFriendsList, NewFriendsList } from '../friends-list.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFriendsList for edit and NewFriendsListFormGroupInput for create.
 */
type FriendsListFormGroupInput = IFriendsList | PartialWithRequiredKeyOf<NewFriendsList>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IFriendsList | NewFriendsList> = Omit<T, 'friendSince'> & {
  friendSince?: string | null;
};

type FriendsListFormRawValue = FormValueOf<IFriendsList>;

type NewFriendsListFormRawValue = FormValueOf<NewFriendsList>;

type FriendsListFormDefaults = Pick<NewFriendsList, 'id' | 'friendSince'>;

type FriendsListFormGroupContent = {
  id: FormControl<FriendsListFormRawValue['id'] | NewFriendsList['id']>;
  friendRequest: FormControl<FriendsListFormRawValue['friendRequest']>;
  friendSince: FormControl<FriendsListFormRawValue['friendSince']>;
  friends: FormControl<FriendsListFormRawValue['friends']>;
  user: FormControl<FriendsListFormRawValue['user']>;
  friend: FormControl<FriendsListFormRawValue['friend']>;
};

export type FriendsListFormGroup = FormGroup<FriendsListFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FriendsListFormService {
  createFriendsListFormGroup(friendsList: FriendsListFormGroupInput = { id: null }): FriendsListFormGroup {
    const friendsListRawValue = this.convertFriendsListToFriendsListRawValue({
      ...this.getFormDefaults(),
      ...friendsList,
    });
    return new FormGroup<FriendsListFormGroupContent>({
      id: new FormControl(
        { value: friendsListRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      friendRequest: new FormControl(friendsListRawValue.friendRequest, {
        validators: [Validators.required],
      }),
      friendSince: new FormControl(friendsListRawValue.friendSince, {
        validators: [Validators.required],
      }),
      friends: new FormControl(friendsListRawValue.friends),
      user: new FormControl(friendsListRawValue.user),
      friend: new FormControl(friendsListRawValue.friend),
    });
  }

  getFriendsList(form: FriendsListFormGroup): IFriendsList | NewFriendsList {
    return this.convertFriendsListRawValueToFriendsList(form.getRawValue() as FriendsListFormRawValue | NewFriendsListFormRawValue);
  }

  resetForm(form: FriendsListFormGroup, friendsList: FriendsListFormGroupInput): void {
    const friendsListRawValue = this.convertFriendsListToFriendsListRawValue({ ...this.getFormDefaults(), ...friendsList });
    form.reset(
      {
        ...friendsListRawValue,
        id: { value: friendsListRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): FriendsListFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      friendSince: currentTime,
    };
  }

  private convertFriendsListRawValueToFriendsList(
    rawFriendsList: FriendsListFormRawValue | NewFriendsListFormRawValue,
  ): IFriendsList | NewFriendsList {
    return {
      ...rawFriendsList,
      friendSince: dayjs(rawFriendsList.friendSince, DATE_TIME_FORMAT),
    };
  }

  private convertFriendsListToFriendsListRawValue(
    friendsList: IFriendsList | (Partial<NewFriendsList> & FriendsListFormDefaults),
  ): FriendsListFormRawValue | PartialWithRequiredKeyOf<NewFriendsListFormRawValue> {
    return {
      ...friendsList,
      friendSince: friendsList.friendSince ? friendsList.friendSince.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
