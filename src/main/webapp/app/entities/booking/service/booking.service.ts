import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IBooking, NewBooking } from '../booking.model';
import { EventService } from 'app/entities/event/service/event.service';
import { ITimeSlot } from 'app/entities/time-slot/time-slot.model';
import { TimeSlotService } from 'app/entities/time-slot/service/time-slot.service';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { EventType } from 'app/entities/enumerations/event-type.model';
import { BookingStatus } from 'app/entities/enumerations/booking-status.model';

export type PartialUpdateBooking = Partial<IBooking> & Pick<IBooking, 'id'>;

type RestOf<T extends IBooking | NewBooking> = Omit<T, 'bookingDate' | 'createdAt' | 'assignedAt'> & {
  bookingDate?: string | null;
  createdAt?: string | null;
  assignedAt?: string | null;
};

export type RestBooking = RestOf<IBooking>;

export type NewRestBooking = RestOf<NewBooking>;

export type PartialUpdateRestBooking = RestOf<PartialUpdateBooking>;

export type EntityResponseType = HttpResponse<IBooking>;
export type EntityArrayResponseType = HttpResponse<IBooking[]>;

@Injectable({ providedIn: 'root' })
export class BookingService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly eventService = inject(EventService);
  protected readonly timeSlotService = inject(TimeSlotService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/bookings');

  getLocationTypeFromEvent(event: string): string {
    const upperEvent = event.toUpperCase();

    switch (upperEvent) {
      case 'EVENT_ROOMS':
        return 'Event Room';
      case 'STUDY_SPACES':
        return 'Study Space';
      case 'FOOTBALL_PITCH':
        return 'Football Pitch';
      case 'BASKETBALL_COURT':
        return 'Basketball Court';
      case 'TENNIS_COURT':
        return 'Tennis Court';
      case 'SWIMMING_POOL':
        return 'Swimming Pool';
      case 'SQUASH_COURT':
        return 'Squash Court';
      case 'DOJO':
        return 'DOJO';
      default:
        return event.replace(/_/g, ' ');
    }
  }

  loadUserBookings(): Observable<any[]> {
    const locations$ = this.http.get<any[]>('api/locations');
    const bookings$ = this.http.get<IBooking[]>('api/bookings', {
      params: new HttpParams().set('bookingDate.greaterThanOrEqual', dayjs().format('YYYY-MM-DD')).set('sort', 'bookingDate,asc'),
    });

    return locations$.pipe(
      switchMap(locations =>
        bookings$.pipe(
          switchMap(bookings => {
            const timeSlotIds = bookings.map(booking => booking.timeSlot?.id).filter(Boolean);
            const timeSlots$ = this.http.get<any[]>(`api/time-slots`, {
              params: new HttpParams().set('id.in', timeSlotIds.join(',')),
            });

            return timeSlots$.pipe(
              map(timeSlots => {
                const processedBookings = bookings.map(booking => {
                  const bookingTimeSlots = timeSlots.filter(ts => ts.booking?.id === booking.id);
                  const firstTimeSlot = bookingTimeSlots[0];
                  const lastTimeSlot = bookingTimeSlots[bookingTimeSlots.length - 1];

                  let timeInfo = 'TBD';
                  if (firstTimeSlot?.startHour !== undefined && lastTimeSlot?.endHour !== undefined) {
                    const startHour = firstTimeSlot.startHour.toString().padStart(2, '0');
                    const endHour = lastTimeSlot.endHour.toString().padStart(2, '0');
                    timeInfo = `${startHour}:00 - ${endHour}:00`;
                  }

                  const formattedDate = booking.bookingDate ? dayjs(booking.bookingDate).format('MMM DD') : '';
                  let locationName = '';

                  if (booking.bookingLocation?.id) {
                    const matchedLocation = locations.find(loc => loc.id === booking.bookingLocation?.id);
                    if (matchedLocation?.name) {
                      locationName = matchedLocation.name;
                    }
                  } else if (booking.timeSlot?.location?.id) {
                    const matchedLocation = locations.find(loc => loc.id === booking.timeSlot?.location?.id);
                    if (matchedLocation?.name) {
                      locationName = matchedLocation.name;
                    }
                  } else if (booking.eventType) {
                    const locationType = this.getLocationTypeFromEvent(booking.eventType);
                    const matchingLocations = locations.filter(loc => loc.name?.startsWith(locationType));
                    if (matchingLocations.length > 0) {
                      locationName = matchingLocations[0].name;
                    } else {
                      locationName = locationType + ' 1';
                    }
                  }

                  if (!locationName) {
                    locationName = 'Venue';
                  }

                  return {
                    id: booking.id,
                    name: booking.eventType ? booking.eventType.replace(/_/g, ' ') : 'Booking',
                    time: timeInfo,
                    date: formattedDate,
                    status: booking.bookingStatus,
                    locationName,
                    partySize: booking.partySize,
                  };
                });

                return processedBookings.slice(0, 8);
              }),
            );
          }),
        ),
      ),
    );
  }

  create(booking: NewBooking): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(booking);
    return this.http
      .post<RestBooking>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(booking: IBooking): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(booking);
    return this.http
      .put<RestBooking>(`${this.resourceUrl}/${this.getBookingIdentifier(booking)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(booking: PartialUpdateBooking): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(booking);
    return this.http
      .patch<RestBooking>(`${this.resourceUrl}/${this.getBookingIdentifier(booking)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestBooking>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestBooking[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getBookingIdentifier(booking: Pick<IBooking, 'id'>): number {
    return booking.id;
  }

  compareBooking(o1: Pick<IBooking, 'id'> | null, o2: Pick<IBooking, 'id'> | null): boolean {
    return o1 && o2 ? this.getBookingIdentifier(o1) === this.getBookingIdentifier(o2) : o1 === o2;
  }

  addBookingToCollectionIfMissing<Type extends Pick<IBooking, 'id'>>(
    bookingCollection: Type[],
    ...bookingsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const bookings: Type[] = bookingsToCheck.filter(isPresent);
    if (bookings.length > 0) {
      const bookingCollectionIdentifiers = bookingCollection.map(bookingItem => this.getBookingIdentifier(bookingItem));
      const bookingsToAdd = bookings.filter(bookingItem => {
        const bookingIdentifier = this.getBookingIdentifier(bookingItem);
        if (bookingCollectionIdentifiers.includes(bookingIdentifier)) {
          return false;
        }
        bookingCollectionIdentifiers.push(bookingIdentifier);
        return true;
      });
      return [...bookingsToAdd, ...bookingCollection];
    }
    return bookingCollection;
  }

  createBookingWithNewTimeSlot(
    selectedTimeSlots: string[],
    selectedDate: string,
    selectedEvent: string,
    selectedActivity: string,
    selectedPartySize: number | null,
    eventService: EventService,
    activities: any[],
  ): NewBooking {
    const firstSelectedSlot = selectedTimeSlots.length > 0 ? selectedTimeSlots[0] : null;
    const parsedSlot = this.timeSlotService.parseTimeSlot(firstSelectedSlot!);

    const selectedEventId = eventService.findEventIdByValue(selectedEvent, activities);

    const newTimeSlot: Omit<ITimeSlot, 'id'> = {
      date: dayjs(selectedDate),
      startHour: parsedSlot.start,
      endHour: parsedSlot.end,
      capacity: null,
      remainingCapacity: null,
      status: null,
      event: { id: selectedEventId } as any,
    };

    const booking: NewBooking = {
      id: null,
      activityType: selectedActivity as ActivityType,
      eventType: selectedEvent.toUpperCase() as EventType,
      bookingDate: dayjs(selectedDate),
      partySize: selectedPartySize ?? 1,
      bookingStatus: 'CONFIRMED' as BookingStatus,
      createdAt: dayjs(),
      timeSlot: newTimeSlot as ITimeSlot,
      assignedAt: null,
      bookedActivity: null,
      bookingLocation: null,
      creator: null,
      activity: null,
    };

    return booking;
  }

  protected convertDateFromClient<T extends IBooking | NewBooking | PartialUpdateBooking>(booking: T): RestOf<T> {
    return {
      ...booking,
      bookingDate: booking.bookingDate?.format(DATE_FORMAT) ?? null,
      createdAt: booking.createdAt?.toJSON() ?? null,
      assignedAt: booking.assignedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restBooking: RestBooking): IBooking {
    return {
      ...restBooking,
      bookingDate: restBooking.bookingDate ? dayjs(restBooking.bookingDate) : undefined,
      createdAt: restBooking.createdAt ? dayjs(restBooking.createdAt) : undefined,
      assignedAt: restBooking.assignedAt ? dayjs(restBooking.assignedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestBooking>): HttpResponse<IBooking> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestBooking[]>): HttpResponse<IBooking[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
