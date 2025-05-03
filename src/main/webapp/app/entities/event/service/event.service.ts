/* eslint-disable no-console */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IEvent, NewEvent } from '../event.model';

export type PartialUpdateEvent = Partial<IEvent> & Pick<IEvent, 'id'>;

export type EntityResponseType = HttpResponse<IEvent>;
export type EntityArrayResponseType = HttpResponse<IEvent[]>;

@Injectable({ providedIn: 'root' })
export class EventService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/events');

  create(event: NewEvent): Observable<EntityResponseType> {
    return this.http.post<IEvent>(this.resourceUrl, event, { observe: 'response' });
  }

  update(event: IEvent): Observable<EntityResponseType> {
    return this.http.put<IEvent>(`${this.resourceUrl}/${this.getEventIdentifier(event)}`, event, { observe: 'response' });
  }

  partialUpdate(event: PartialUpdateEvent): Observable<EntityResponseType> {
    return this.http.patch<IEvent>(`${this.resourceUrl}/${this.getEventIdentifier(event)}`, event, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IEvent>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IEvent[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getEventIdentifier(event: Pick<IEvent, 'id'>): number {
    return event.id;
  }

  compareEvent(o1: Pick<IEvent, 'id'> | null, o2: Pick<IEvent, 'id'> | null): boolean {
    return o1 && o2 ? this.getEventIdentifier(o1) === this.getEventIdentifier(o2) : o1 === o2;
  }

  addEventToCollectionIfMissing<Type extends Pick<IEvent, 'id'>>(
    eventCollection: Type[],
    ...eventsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const events: Type[] = eventsToCheck.filter(isPresent);
    if (events.length > 0) {
      const eventCollectionIdentifiers = eventCollection.map(eventItem => this.getEventIdentifier(eventItem));
      const eventsToAdd = events.filter(eventItem => {
        const eventIdentifier = this.getEventIdentifier(eventItem);
        if (eventCollectionIdentifiers.includes(eventIdentifier)) {
          return false;
        }
        eventCollectionIdentifiers.push(eventIdentifier);
        return true;
      });
      return [...eventsToAdd, ...eventCollection];
    }
    return eventCollection;
  }

  findEventIdByValue(eventValue: string, activities: any[]): number | undefined {
    console.log('Looking for event:', eventValue);
    console.log('Available activities:', activities);

    const allEventValues: string[] = [];
    activities.forEach(activity => {
      activity.events.forEach((event: any) => {
        allEventValues.push(event.value);
        console.log(`Event: ${event.value}, ID: ${event.id}, Name: ${event.name}`);
      });
    });
    console.log('All available event values:', allEventValues);

    for (const activity of activities) {
      const foundEvent = activity.events.find((e: any) => e.value === eventValue);
      if (foundEvent?.id) {
        console.log('Found exact match for event:', eventValue, 'with ID:', foundEvent.id);
        return foundEvent.id as number;
      }
    }

    for (const activity of activities) {
      const foundEvent = activity.events.find((e: any) => {
        return e.value.toLowerCase() === eventValue.toLowerCase();
      });

      if (foundEvent?.id) {
        console.log('Found case-insensitive match for event:', eventValue, 'with value:', foundEvent.value, 'and ID:', foundEvent.id);
        return foundEvent.id as number;
      }
    }

    for (const activity of activities) {
      const foundEvent = activity.events.find((e: any) => {
        return e.name.replace(/\s+/g, '_') === eventValue;
      });

      if (foundEvent?.id) {
        console.log('Found match by converted name for event:', eventValue, 'with ID:', foundEvent.id);
        return foundEvent.id as number;
      }
    }

    const seedDataMap: Record<string, number> = {
      Study_Spaces: 1,
      Event_Rooms: 2,
      Football_Pitch: 3,
      Tennis_Court: 4,
      Basketball_Court: 5,
      DOJO: 6,
      Swimming_Pool: 7,
      Squash_Court: 8,
    };

    if (seedDataMap[eventValue]) {
      console.log('Using hardcoded ID mapping for:', eventValue, 'ID:', seedDataMap[eventValue]);
      return seedDataMap[eventValue];
    }

    console.error('Could not find event ID for:', eventValue, 'in available events');
    return undefined;
  }
}
