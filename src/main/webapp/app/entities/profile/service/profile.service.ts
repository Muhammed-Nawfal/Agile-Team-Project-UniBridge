import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IProfile, NewProfile } from '../profile.model';
import { IUser } from 'app/entities/user/user.model';
import { AccountService } from 'app/core/auth/account.service';

export type PartialUpdateProfile = Partial<IProfile> & Pick<IProfile, 'id'>;
export type EntityResponseType = HttpResponse<IProfile>;
export type EntityArrayResponseType = HttpResponse<IProfile[]>;

@Injectable({ providedIn: 'root' })
export class ProfileService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/profiles');
  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
    protected accountService: AccountService,
  ) {}
  // Points to /api/profiles

  create(profile: NewProfile): Observable<EntityResponseType> {
    return this.http.post<IProfile>(this.resourceUrl, profile, { observe: 'response' });
  }

  // -- Remove or comment out the old findByUserLogin() method --
  // findByUserLogin(login: string): Observable<EntityResponseType> {
  //   return this.http.get<IProfile>(`${this.resourceUrl}/by-user-login/${login}`, { observe: 'response' });
  // }

  /**
   * Use the User Resource route:
   * GET /api/admin/users/{login}
   * to retrieve user details (including ID).
   */
  findUserByLogin(login: string): Observable<HttpResponse<IUser>> {
    // Call the user resource directly at /api/admin/users/{login}
    return this.http.get<IUser>(`api/admin/users/${login}`, { observe: 'response' });
  }

  findMyProfile(): Observable<EntityResponseType> {
    return this.http.get<IProfile>(`${this.resourceUrl}/my`, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    // GET /api/profiles/{id}
    return this.http.get<IProfile>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  update(profile: IProfile): Observable<EntityResponseType> {
    return this.http.put<IProfile>(`${this.resourceUrl}/${this.getProfileIdentifier(profile)}`, profile, { observe: 'response' });
  }

  partialUpdate(profile: PartialUpdateProfile): Observable<EntityResponseType> {
    return this.http.patch<IProfile>(`${this.resourceUrl}/${this.getProfileIdentifier(profile)}`, profile, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProfile[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  anonymize(id: number): Observable<HttpResponse<{}>> {
    return this.http.put(`${this.resourceUrl}/${id}/anonymize`, {}, { observe: 'response' });
  }

  getProfileIdentifier(profile: Pick<IProfile, 'id'>): number {
    return profile.id;
  }

  compareProfile(o1: Pick<IProfile, 'id'> | null, o2: Pick<IProfile, 'id'> | null): boolean {
    return o1 && o2 ? this.getProfileIdentifier(o1) === this.getProfileIdentifier(o2) : o1 === o2;
  }

  addProfileToCollectionIfMissing<Type extends Pick<IProfile, 'id'>>(
    profileCollection: Type[],
    ...profilesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const profiles: Type[] = profilesToCheck.filter(isPresent);
    if (profiles.length > 0) {
      const profileCollectionIdentifiers = profileCollection.map(profileItem => this.getProfileIdentifier(profileItem));
      const profilesToAdd = profiles.filter(profileItem => {
        const profileIdentifier = this.getProfileIdentifier(profileItem);
        if (profileCollectionIdentifiers.includes(profileIdentifier)) {
          return false;
        }
        profileCollectionIdentifiers.push(profileIdentifier);
        return true;
      });
      return [...profilesToAdd, ...profileCollection];
    }
    return profileCollection;
  }
}
