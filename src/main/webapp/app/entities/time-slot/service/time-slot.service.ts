/* eslint-disable no-console */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable, map, firstValueFrom } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITimeSlot, NewTimeSlot } from '../time-slot.model';
import { EventService } from 'app/entities/event/service/event.service';
import { BookingService } from 'app/entities/booking/service/booking.service';

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

  deleteTimeSlotsForBooking(bookingId: number): Observable<void> {
    return new Observable<void>(subscriber => {
      this.http
        .get<any[]>(`api/time-slots`, {
          params: new HttpParams().set('booking.id.equals', bookingId.toString()),
        })
        .subscribe({
          next: timeSlots => {
            // Filter time slots to only those that actually belong to this booking
            const validTimeSlots = timeSlots.filter(ts => ts.booking?.id === bookingId);

            if (validTimeSlots.length === 0) {
              subscriber.next();
              subscriber.complete();
              return;
            }

            // Delete each time slot
            const deleteTimeSlots$ = validTimeSlots.map(timeSlot => this.delete(timeSlot.id));

            // Wait for all time slots to be deleted
            Promise.all(deleteTimeSlots$.map(obs => firstValueFrom(obs)))
              .then(() => {
                subscriber.next();
                subscriber.complete();
              })
              .catch((error: unknown) => {
                subscriber.error(error);
              });
          },
          error(error) {
            subscriber.error(error);
          },
        });
    });
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

  parseTimeSlot(timeSlot: string): { start: number; end: number } {
    const [startStr, endStr] = timeSlot.split(' - ');
    const startHour = parseInt(startStr.split(':')[0], 10);
    const endHour = parseInt(endStr.split(':')[0], 10) || 24;

    return { start: startHour, end: endHour };
  }

  compareTimeSlots(a: string, b: string): number {
    const timeA = this.parseTimeSlot(a);
    const timeB = this.parseTimeSlot(b);
    return timeA.start - timeB.start;
  }

  areSelectedSlotsConsecutive(selectedTimeSlots: string[]): boolean {
    if (selectedTimeSlots.length <= 1) {
      return true;
    }

    const sortedSlots = [...selectedTimeSlots].sort((a, b) => this.compareTimeSlots(a, b));

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentSlot = this.parseTimeSlot(sortedSlots[i]);
      const nextSlot = this.parseTimeSlot(sortedSlots[i + 1]);

      if (currentSlot.end !== nextSlot.start) {
        return false;
      }
    }

    return true;
  }

  generateTimeSlots(startTime: number, endTime: number): string[] {
    const timeSlots: string[] = [];
    const actualEndTime = endTime === 24 ? 24 : endTime;

    for (let hour = startTime; hour < actualEndTime; hour++) {
      const startHour = hour.toString().padStart(2, '0');
      const endHour = hour + 1 > 23 ? '00' : (hour + 1).toString().padStart(2, '0');
      const timeSlot = `${startHour}:00 - ${endHour}:00`;
      timeSlots.push(timeSlot);
    }

    return timeSlots;
  }

  isTimeSlotDisabled(slot: string, selectedTimeSlots: string[], maxSlots: number): boolean {
    if (selectedTimeSlots.length === 0) {
      return false;
    }

    if (selectedTimeSlots.includes(slot)) {
      return false;
    }

    if (selectedTimeSlots.length >= maxSlots) {
      return true;
    }

    const slotTime = this.parseTimeSlot(slot);

    for (const selectedSlot of selectedTimeSlots) {
      const selectedTime = this.parseTimeSlot(selectedSlot);

      if (slotTime.start === selectedTime.end || slotTime.end === selectedTime.start) {
        return false;
      }
    }

    return true;
  }

  isTimeSlotFullyBooked(timeSlot: string, fullyBookedTimeSlots: string[]): boolean {
    return fullyBookedTimeSlots.includes(timeSlot);
  }

  checkForFullyBookedTimeSlots(
    timeSlots: string[],
    availableTimeSlots: ITimeSlot[],
    selectedDate: string,
    selectedEvent: string,
    activities: any[],
    eventService: EventService,
    bookingService: BookingService,
    http: HttpClient,
  ): Observable<string[]> {
    return new Observable<string[]>(subscriber => {
      const fullyBookedTimeSlots: string[] = [];

      const locationTypeName = bookingService.getLocationTypeFromEvent(selectedEvent);

      let eventCapacity = null;
      for (const activity of activities) {
        const foundEvent = activity.events.find((e: any) => e.value === selectedEvent);
        if (foundEvent) {
          eventCapacity = foundEvent.capacity;
          break;
        }
      }

      const formattedSelectedDate = dayjs(selectedDate).format('YYYY-MM-DD');

      http
        .get<any[]>('api/locations', {
          params: {
            'status.equals': 'AVAILABLE',
            'name.startsWith': locationTypeName,
          },
        })
        .subscribe({
          next: locations => {
            const matchingLocations = locations.filter(loc => {
              const locName = loc.name?.toLowerCase().replace(/_/g, ' ');
              const typeName = locationTypeName.toLowerCase().replace(/_/g, ' ');
              return locName?.includes(typeName);
            });

            const totalAvailableLocations = matchingLocations.length;
            console.log(`Total available ${locationTypeName} locations: ${totalAvailableLocations}`);

            if (totalAvailableLocations === 0) {
              subscriber.next([...timeSlots]);
              subscriber.complete();
              return;
            }

            timeSlots.forEach(timeSlot => {
              const parsedSlot = this.parseTimeSlot(timeSlot);
              const startHour = parsedSlot.start;
              const endHour = parsedSlot.end;

              const matchingDBSlots = availableTimeSlots.filter(slot => {
                const timeMatch = slot.startHour === startHour && slot.endHour === endHour;

                const slotDate = typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD');
                const dateMatch = slotDate === formattedSelectedDate;

                const eventId = eventService.findEventIdByValue(selectedEvent, activities);
                const eventMatch = slot.event?.id === eventId;

                return timeMatch && dateMatch && eventMatch;
              });

              const bookedLocationsCount = matchingDBSlots.filter(slot => Boolean(slot.location?.id)).length;

              console.log(
                `Time slot ${timeSlot} on ${formattedSelectedDate} for event ${selectedEvent}: ${bookedLocationsCount} of ${totalAvailableLocations} locations booked`,
              );

              if (bookedLocationsCount >= totalAvailableLocations) {
                fullyBookedTimeSlots.push(timeSlot);
                console.log(
                  `Time slot ${timeSlot} on ${formattedSelectedDate} for event ${selectedEvent} is fully booked (all locations taken)`,
                );
              }
            });

            subscriber.next(fullyBookedTimeSlots);
            subscriber.complete();
          },
          error(error) {
            console.error('Error checking location availability:', error);
            subscriber.error(error);
          },
        });
    });
  }

  updateTimeSlotsWithBookingId(timeSlots: ITimeSlot[], bookingId: number, locationId?: number): void {
    let updatedCount = 0;

    timeSlots.forEach(timeSlot => {
      if (!timeSlot.id) {
        console.warn('Cannot update time slot without ID');
        return;
      }

      const updatedTimeSlot = {
        ...timeSlot,
        booking: { id: bookingId },
        location: locationId ? { id: locationId } : null,
      };

      this.http.put<ITimeSlot>(`api/time-slots/${timeSlot.id}`, updatedTimeSlot).subscribe({
        next() {
          console.log(
            `Successfully updated time slot ${timeSlot.id} with booking ${bookingId}${locationId ? ` and location ${locationId}` : ''}`,
          );
          updatedCount++;

          if (updatedCount === timeSlots.length) {
            alert(`Booking created successfully with ${timeSlots.length} time slot(s)!`);
            window.location.reload();
          }
        },
        error(error) {
          console.error(`Error updating time slot ${timeSlot.id} with booking reference`, error);
          updatedCount++;

          if (updatedCount === timeSlots.length) {
            alert(`Booking created but some time slots may not be properly linked.`);
            window.location.reload();
          }
        },
      });
    });
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
