import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITimeSlot, NewTimeSlot } from '../time-slot.model';

export type PartialUpdateTimeSlot = Partial<ITimeSlot> & Pick<ITimeSlot, 'id'>;

type RestOf<T extends ITimeSlot | NewTimeSlot> = Omit<T, 'date'> & {
  date?: string | null;
};

export type RestTimeSlot = RestOf<ITimeSlot>;

export type NewRestTimeSlot = RestOf<NewTimeSlot>;

export type PartialUpdateRestTimeSlot = RestOf<PartialUpdateTimeSlot>;

export type EntityResponseType = HttpResponse<ITimeSlot>;
export type EntityArrayResponseType = HttpResponse<ITimeSlot[]>;

@Injectable({ providedIn: 'root' })
export class TimeSlotService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/time-slots');

  create(timeSlot: NewTimeSlot): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(timeSlot);
    return this.http
      .post<RestTimeSlot>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(timeSlot: ITimeSlot): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(timeSlot);
    return this.http
      .put<RestTimeSlot>(`${this.resourceUrl}/${this.getTimeSlotIdentifier(timeSlot)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(timeSlot: PartialUpdateTimeSlot): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(timeSlot);
    return this.http
      .patch<RestTimeSlot>(`${this.resourceUrl}/${this.getTimeSlotIdentifier(timeSlot)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestTimeSlot>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestTimeSlot[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTimeSlotIdentifier(timeSlot: Pick<ITimeSlot, 'id'>): number {
    return timeSlot.id;
  }

  compareTimeSlot(o1: Pick<ITimeSlot, 'id'> | null, o2: Pick<ITimeSlot, 'id'> | null): boolean {
    return o1 && o2 ? this.getTimeSlotIdentifier(o1) === this.getTimeSlotIdentifier(o2) : o1 === o2;
  }

  addTimeSlotToCollectionIfMissing<Type extends Pick<ITimeSlot, 'id'>>(
    timeSlotCollection: Type[],
    ...timeSlotsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const timeSlots: Type[] = timeSlotsToCheck.filter(isPresent);
    if (timeSlots.length > 0) {
      const timeSlotCollectionIdentifiers = timeSlotCollection.map(timeSlotItem => this.getTimeSlotIdentifier(timeSlotItem));
      const timeSlotsToAdd = timeSlots.filter(timeSlotItem => {
        const timeSlotIdentifier = this.getTimeSlotIdentifier(timeSlotItem);
        if (timeSlotCollectionIdentifiers.includes(timeSlotIdentifier)) {
          return false;
        }
        timeSlotCollectionIdentifiers.push(timeSlotIdentifier);
        return true;
      });
      return [...timeSlotsToAdd, ...timeSlotCollection];
    }
    return timeSlotCollection;
  }

  protected convertDateFromClient<T extends ITimeSlot | NewTimeSlot | PartialUpdateTimeSlot>(timeSlot: T): RestOf<T> {
    return {
      ...timeSlot,
      date: timeSlot.date?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restTimeSlot: RestTimeSlot): ITimeSlot {
    return {
      ...restTimeSlot,
      date: restTimeSlot.date ? dayjs(restTimeSlot.date) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestTimeSlot>): HttpResponse<ITimeSlot> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestTimeSlot[]>): HttpResponse<ITimeSlot[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
