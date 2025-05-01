import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAction, NewAction } from '../action.model';

export type PartialUpdateAction = Partial<IAction> & Pick<IAction, 'id'>;

type RestOf<T extends IAction | NewAction> = Omit<T, 'timestamp'> & {
  timestamp?: string | null;
};

export type RestAction = RestOf<IAction>;

export type NewRestAction = RestOf<NewAction>;

export type PartialUpdateRestAction = RestOf<PartialUpdateAction>;

export type EntityResponseType = HttpResponse<IAction>;
export type EntityArrayResponseType = HttpResponse<IAction[]>;

@Injectable({ providedIn: 'root' })
export class ActionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/actions');

  create(action: NewAction): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(action);
    return this.http
      .post<RestAction>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(action: IAction): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(action);
    return this.http
      .put<RestAction>(`${this.resourceUrl}/${this.getActionIdentifier(action)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(action: PartialUpdateAction): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(action);
    return this.http
      .patch<RestAction>(`${this.resourceUrl}/${this.getActionIdentifier(action)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestAction>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAction[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getActionIdentifier(action: Pick<IAction, 'id'>): number {
    return action.id;
  }

  compareAction(o1: Pick<IAction, 'id'> | null, o2: Pick<IAction, 'id'> | null): boolean {
    return o1 && o2 ? this.getActionIdentifier(o1) === this.getActionIdentifier(o2) : o1 === o2;
  }

  addActionToCollectionIfMissing<Type extends Pick<IAction, 'id'>>(
    actionCollection: Type[],
    ...actionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const actions: Type[] = actionsToCheck.filter(isPresent);
    if (actions.length > 0) {
      const actionCollectionIdentifiers = actionCollection.map(actionItem => this.getActionIdentifier(actionItem));
      const actionsToAdd = actions.filter(actionItem => {
        const actionIdentifier = this.getActionIdentifier(actionItem);
        if (actionCollectionIdentifiers.includes(actionIdentifier)) {
          return false;
        }
        actionCollectionIdentifiers.push(actionIdentifier);
        return true;
      });
      return [...actionsToAdd, ...actionCollection];
    }
    return actionCollection;
  }

  protected convertDateFromClient<T extends IAction | NewAction | PartialUpdateAction>(action: T): RestOf<T> {
    return {
      ...action,
      timestamp: action.timestamp?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restAction: RestAction): IAction {
    return {
      ...restAction,
      timestamp: restAction.timestamp ? dayjs(restAction.timestamp) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestAction>): HttpResponse<IAction> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAction[]>): HttpResponse<IAction[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
