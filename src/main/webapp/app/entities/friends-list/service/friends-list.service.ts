import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFriendsList, NewFriendsList } from '../friends-list.model';
import { Decision } from 'app/entities/enumerations/decision.model';

export type PartialUpdateFriendsList = Partial<IFriendsList> & Pick<IFriendsList, 'id'>;

type RestOf<T extends IFriendsList | NewFriendsList> = Omit<T, 'requestTime' | 'friendSince'> & {
  requestTime?: string | null;
  friendSince?: string | null;
};

export type RestFriendsList = RestOf<IFriendsList>;

export type NewRestFriendsList = RestOf<NewFriendsList>;

export type PartialUpdateRestFriendsList = RestOf<PartialUpdateFriendsList>;

export type EntityResponseType = HttpResponse<IFriendsList>;
export type EntityArrayResponseType = HttpResponse<IFriendsList[]>;

@Injectable({ providedIn: 'root' })
export class FriendsListService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/friends-lists');
  protected userFriendsUrl = this.applicationConfigService.getEndpointFor('api/user-friends');

  create(friendsList: NewFriendsList): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(friendsList);
    return this.http
      .post<RestFriendsList>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(friendsList: IFriendsList): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(friendsList);
    return this.http
      .put<RestFriendsList>(`${this.resourceUrl}/${this.getFriendsListIdentifier(friendsList)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(friendsList: PartialUpdateFriendsList): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(friendsList);
    return this.http
      .patch<RestFriendsList>(`${this.resourceUrl}/${this.getFriendsListIdentifier(friendsList)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestFriendsList>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestFriendsList[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // New methods for friend requests

  /**
   * Send a friend request from the current user to another profile
   * @param requestedProfileId The ID of the profile to send the request to
   * @returns An observable with the created friend request
   */
  sendFriendRequest(requestedProfileId: number): Observable<EntityResponseType> {
    // Fix: Include the request body as empty object and ensure proper URL format
    return this.http
      .post<RestFriendsList>(`${this.userFriendsUrl}/send-request/${requestedProfileId}`, {}, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  /**
   * Respond to a friend request
   * @param friendsListId The ID of the friends list to respond to
   * @param decision The decision (ACCEPT or DECLINED)
   * @returns An observable with the updated friend request
   */
  respondToFriendRequest(friendsListId: number, decision: Decision): Observable<EntityResponseType> {
    // Updated to match the backend API expecting a query parameter instead of request body
    return this.http
      .put<RestFriendsList>(`${this.userFriendsUrl}/respond/${friendsListId}?decision=${decision}`, {}, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  /**
   * Get all accepted friends for the current user
   * @returns An observable with the list of accepted friends
   */
  getCurrentUserAcceptedFriends(): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestFriendsList[]>(`${this.userFriendsUrl}/accepted`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /**
   * Get all pending friend requests for the current user
   * @returns An observable with the list of pending friend requests
   */
  getCurrentUserPendingFriendRequests(): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestFriendsList[]>(`${this.userFriendsUrl}/pending`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /**
   * Get all friend requests sent by the current user
   * @returns An observable with the list of sent friend requests
   */
  getCurrentUserSentFriendRequests(): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestFriendsList[]>(`${this.userFriendsUrl}/sent`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /**
   * Check if the current user has a pending or accepted friend request with another profile
   * @param profileId The ID of the profile to check
   * @returns An observable that returns the friendship status and ID if applicable
   */
  checkFriendshipStatus(profileId: number): Observable<{ status: string; friendsListId?: number }> {
    return this.http.get<{ status: string; friendsListId?: number }>(`${this.userFriendsUrl}/check-status/${profileId}`);
  }

  getFriendsListIdentifier(friendsList: Pick<IFriendsList, 'id'>): number {
    return friendsList.id;
  }

  compareFriendsList(o1: Pick<IFriendsList, 'id'> | null, o2: Pick<IFriendsList, 'id'> | null): boolean {
    return o1 && o2 ? this.getFriendsListIdentifier(o1) === this.getFriendsListIdentifier(o2) : o1 === o2;
  }

  addFriendsListToCollectionIfMissing<Type extends Pick<IFriendsList, 'id'>>(
    friendsListCollection: Type[],
    ...friendsListsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const friendsLists: Type[] = friendsListsToCheck.filter(isPresent);
    if (friendsLists.length > 0) {
      const friendsListCollectionIdentifiers = friendsListCollection.map(friendsListItem => this.getFriendsListIdentifier(friendsListItem));
      const friendsListsToAdd = friendsLists.filter(friendsListItem => {
        const friendsListIdentifier = this.getFriendsListIdentifier(friendsListItem);
        if (friendsListCollectionIdentifiers.includes(friendsListIdentifier)) {
          return false;
        }
        friendsListCollectionIdentifiers.push(friendsListIdentifier);
        return true;
      });
      return [...friendsListsToAdd, ...friendsListCollection];
    }
    return friendsListCollection;
  }

  protected convertDateFromClient<T extends IFriendsList | NewFriendsList | PartialUpdateFriendsList>(friendsList: T): RestOf<T> {
    return {
      ...friendsList,
      requestTime: friendsList.requestTime?.toJSON() ?? null,
      friendSince: friendsList.friendSince?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restFriendsList: RestFriendsList): IFriendsList {
    return {
      ...restFriendsList,
      requestTime: restFriendsList.requestTime ? dayjs(restFriendsList.requestTime) : undefined,
      friendSince: restFriendsList.friendSince ? dayjs(restFriendsList.friendSince) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestFriendsList>): HttpResponse<IFriendsList> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestFriendsList[]>): HttpResponse<IFriendsList[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
