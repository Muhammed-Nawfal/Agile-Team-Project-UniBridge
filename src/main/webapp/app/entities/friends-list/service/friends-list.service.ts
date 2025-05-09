import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFriendsList, NewFriendsList } from '../friends-list.model';
import { Decision } from 'app/entities/enumerations/decision.model';
import { IProfile } from '../../profile/profile.model';

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

  // Mock value for current profile ID - replace with actual implementation
  private currentUserProfileId = 1; // Replace with actual current profile ID

  /**
   * Get the current profile ID from local storage or another source
   * This is a temporary solution - you should implement a proper way to get the current profile ID
   */
  getCurrentUserProfileId(): number {
    // Replace this with actual implementation based on your auth system
    // Example implementation using local storage:
    const profileId = localStorage.getItem('currentProfileId');
    if (profileId) {
      return parseInt(profileId, 10);
    }

    // Default fallback value
    return this.currentUserProfileId;
  }

  /**
   * Set the current profile ID (for testing or when profile ID changes)
   */
  setCurrentUserProfileId(profileId: number): void {
    this.currentUserProfileId = profileId;

    // If using local storage:
    localStorage.setItem('currentProfileId', profileId.toString());
  }

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

  // ====== BACKWARD COMPATIBLE METHODS ======

  /**
   * Send a friend request from the current user to another profile
   * Handle DECLINED relationships by updating their status to PENDING again
   * @param requestedProfileId The ID of the profile to send the request to
   * @returns An observable with the created or updated friend request
   */
  sendFriendRequest(requestedProfileId: number): Observable<EntityResponseType> {
    // Use the new method internally but maintain the old signature
    return this.sendFriendRequestWithProfiles(this.getCurrentUserProfileId(), requestedProfileId);
  }

  /**
   * Respond to a friend request
   * @param friendsListId The ID of the friends list to respond to
   * @param decision The decision (ACCEPT, DECLINED, or PENDING)
   * @returns An observable with the updated friend request
   */
  respondToFriendRequest(friendsListId: number, decision: Decision): Observable<EntityResponseType> {
    // Use the new method internally but maintain the old signature
    return this.respondToFriendRequestWithProfiles(friendsListId, this.getCurrentUserProfileId(), decision);
  }

  /**
   * Get all accepted friends for the current user
   * @returns An observable with the list of accepted friends
   */
  getCurrentUserAcceptedFriends(): Observable<EntityArrayResponseType> {
    // Use the new method internally
    return this.getAcceptedFriendsWithId(this.getCurrentUserProfileId());
  }

  /**
   * Get all pending friend requests for the current user
   * @returns An observable with the list of pending friend requests
   */
  getCurrentUserPendingFriendRequests(): Observable<EntityArrayResponseType> {
    // Use the new method internally
    return this.getPendingFriendRequestsWithId(this.getCurrentUserProfileId());
  }

  /**
   * Get all friend requests sent by the current user
   * @returns An observable with the list of sent friend requests
   */
  getCurrentUserSentFriendRequests(): Observable<EntityArrayResponseType> {
    // Use the new method internally
    return this.getSentFriendRequestsWithId(this.getCurrentUserProfileId());
  }

  /**
   * Get profiles that the current user is following (has accepted friendship with)
   * @returns Observable with array of profile objects
   */
  getFollowedProfiles(): Observable<HttpResponse<IProfile[]>> {
    // Use the new method internally
    return this.getFollowedProfilesWithId(this.getCurrentUserProfileId());
  }

  /**
   * Check if the current user has a pending or accepted friend request with another profile
   * @param profileId The ID of the profile to check
   * @returns An observable that returns the friendship status and ID if applicable
   */
  checkFriendshipStatus(profileId: number): Observable<{ status: string; friendsListId?: number }> {
    // Use the new method internally
    return this.checkFriendshipStatusWithProfiles(this.getCurrentUserProfileId(), profileId);
  }

  // ====== NEW METHODS WITH EXPLICIT PROFILE IDS ======

  /**
   * Send a friend request from the specified profile to another profile
   * @param fromProfileId The ID of the profile sending the request
   * @param toProfileId The ID of the profile to send the request to
   * @returns An observable with the created or updated friend request
   */
  sendFriendRequestWithProfiles(fromProfileId: number, toProfileId: number): Observable<EntityResponseType> {
    return this.http
      .post<RestFriendsList>(`${this.userFriendsUrl}/send-request/${fromProfileId}/${toProfileId}`, {}, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  /**
   * Respond to a friend request
   * @param friendsListId The ID of the friends list to respond to
   * @param respondingProfileId The ID of the profile responding to the request
   * @param decision The decision (ACCEPT, DECLINED, or PENDING)
   * @returns An observable with the updated friend request
   */
  respondToFriendRequestWithProfiles(
    friendsListId: number,
    respondingProfileId: number,
    decision: Decision,
  ): Observable<EntityResponseType> {
    return this.http
      .put<RestFriendsList>(
        `${this.userFriendsUrl}/respond/${friendsListId}/${respondingProfileId}?decision=${decision}`,
        {},
        { observe: 'response' },
      )
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  /**
   * Get all accepted friends for a specific profile
   * @param profileId The ID of the profile to get accepted friends for
   * @returns An observable with the list of accepted friends
   */
  getAcceptedFriendsWithId(profileId: number): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestFriendsList[]>(`${this.userFriendsUrl}/accepted/${profileId}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /**
   * Get all pending friend requests for a specific profile
   * @param profileId The ID of the profile to get pending requests for
   * @returns An observable with the list of pending friend requests
   */
  getPendingFriendRequestsWithId(profileId: number): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestFriendsList[]>(`${this.userFriendsUrl}/pending/${profileId}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /**
   * Get all friend requests sent by a specific profile
   * @param profileId The ID of the profile to get sent requests for
   * @returns An observable with the list of sent friend requests
   */
  getSentFriendRequestsWithId(profileId: number): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestFriendsList[]>(`${this.userFriendsUrl}/sent/${profileId}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /**
   * Get profiles that a specific profile is following (has accepted friendship with)
   * @param profileId The ID of the profile to get followed profiles for
   * @returns Observable with array of profile objects
   */
  getFollowedProfilesWithId(profileId: number): Observable<HttpResponse<IProfile[]>> {
    return this.http.get<IProfile[]>(`${this.userFriendsUrl}/followed-profiles/${profileId}`, { observe: 'response' });
  }

  /**
   * Check friendship status between two profiles
   * @param profileId1 The ID of the first profile
   * @param profileId2 The ID of the second profile
   * @returns An observable that returns the friendship status and ID if applicable
   */
  checkFriendshipStatusWithProfiles(profileId1: number, profileId2: number): Observable<{ status: string; friendsListId?: number }> {
    return this.http.get<{ status: string; friendsListId?: number }>(`${this.userFriendsUrl}/check-status/${profileId1}/${profileId2}`);
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
