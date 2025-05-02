import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IMessageThread, NewMessageThread } from '../message-thread.model';

export type PartialUpdateMessageThread = Partial<IMessageThread> & Pick<IMessageThread, 'id'>;

type RestOf<T extends IMessageThread | NewMessageThread> = Omit<T, 'createdOn' | 'updatedOn'> & {
  createdOn?: string | null;
  updatedOn?: string | null;
};

export type RestMessageThread = RestOf<IMessageThread>;

export type NewRestMessageThread = RestOf<NewMessageThread>;

export type PartialUpdateRestMessageThread = RestOf<PartialUpdateMessageThread>;

export type EntityResponseType = HttpResponse<IMessageThread>;
export type EntityArrayResponseType = HttpResponse<IMessageThread[]>;

@Injectable({ providedIn: 'root' })
export class MessageThreadService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/message-threads');

  create(messageThread: NewMessageThread): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(messageThread);
    return this.http
      .post<RestMessageThread>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(messageThread: IMessageThread): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(messageThread);
    return this.http
      .put<RestMessageThread>(`${this.resourceUrl}/${this.getMessageThreadIdentifier(messageThread)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(messageThread: PartialUpdateMessageThread): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(messageThread);
    return this.http
      .patch<RestMessageThread>(`${this.resourceUrl}/${this.getMessageThreadIdentifier(messageThread)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestMessageThread>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestMessageThread[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getMessageThreadIdentifier(messageThread: Pick<IMessageThread, 'id'>): number {
    return messageThread.id;
  }

  compareMessageThread(o1: Pick<IMessageThread, 'id'> | null, o2: Pick<IMessageThread, 'id'> | null): boolean {
    return o1 && o2 ? this.getMessageThreadIdentifier(o1) === this.getMessageThreadIdentifier(o2) : o1 === o2;
  }

  addMessageThreadToCollectionIfMissing<Type extends Pick<IMessageThread, 'id'>>(
    messageThreadCollection: Type[],
    ...messageThreadsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const messageThreads: Type[] = messageThreadsToCheck.filter(isPresent);
    if (messageThreads.length > 0) {
      const messageThreadCollectionIdentifiers = messageThreadCollection.map(messageThreadItem =>
        this.getMessageThreadIdentifier(messageThreadItem),
      );
      const messageThreadsToAdd = messageThreads.filter(messageThreadItem => {
        const messageThreadIdentifier = this.getMessageThreadIdentifier(messageThreadItem);
        if (messageThreadCollectionIdentifiers.includes(messageThreadIdentifier)) {
          return false;
        }
        messageThreadCollectionIdentifiers.push(messageThreadIdentifier);
        return true;
      });
      return [...messageThreadsToAdd, ...messageThreadCollection];
    }
    return messageThreadCollection;
  }

  protected convertDateFromClient<T extends IMessageThread | NewMessageThread | PartialUpdateMessageThread>(messageThread: T): RestOf<T> {
    return {
      ...messageThread,
      createdOn: messageThread.createdOn?.toJSON() ?? null,
      updatedOn: messageThread.updatedOn?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restMessageThread: RestMessageThread): IMessageThread {
    return {
      ...restMessageThread,
      createdOn: restMessageThread.createdOn ? dayjs(restMessageThread.createdOn) : undefined,
      updatedOn: restMessageThread.updatedOn ? dayjs(restMessageThread.updatedOn) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestMessageThread>): HttpResponse<IMessageThread> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMessageThread[]>): HttpResponse<IMessageThread[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
