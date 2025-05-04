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
import { IActivity } from 'app/entities/activity/activity.model';
import { IProfile } from 'app/entities/profile/profile.model';

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

  loadUserBookings(creatorId: number): Observable<
    {
      id: number;
      name: string;
      date: string;
      time: string;
      locationName: string;
      partySize: number | null | undefined;
      status: 'CONFIRMED' | 'CANCELLED' | null | undefined;
      activityType: string | null | undefined;
      timeSlot: any;
      bookedActivity: IActivity | null | undefined;
    }[]
  > {
    const locations$ = this.http.get<any[]>('api/locations');
    const bookings$ = this.http.get<IBooking[]>('api/bookings', {
      params: new HttpParams()
        .set('creatorId', creatorId.toString())
        .set('bookingDate.greaterThanOrEqual', dayjs().format('YYYY-MM-DD'))
        .set('sort', 'bookingDate,asc')
        .set('eagerload', 'true')
        .set('eagerloadRelations', 'bookedActivity'),
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
                    name: booking.eventType ? this.getLocationTypeFromEvent(booking.eventType) : 'Unknown Event',
                    date: formattedDate,
                    time: timeInfo,
                    locationName,
                    partySize: booking.partySize,
                    status: booking.bookingStatus,
                    activityType: booking.activityType,
                    timeSlot: firstTimeSlot,
                    bookedActivity: booking.bookedActivity,
                  };
                });

                return processedBookings;
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

  deleteBooking(bookingId: number): Observable<void> {
    return new Observable<void>(subscriber => {
      // First, get the full booking details
      this.find(bookingId).subscribe({
        next: response => {
          const fullBooking = response.body;
          if (!fullBooking) {
            subscriber.error('Could not find booking details');
            return;
          }

          // Create updated booking with timeSlot set to null
          const updatedBooking = {
            ...fullBooking,
            timeSlot: null,
            bookingStatus: 'CANCELLED' as keyof typeof BookingStatus,
          };

          // Update the booking
          this.update(updatedBooking).subscribe({
            next: () => {
              // Now we can delete the time slots
              this.timeSlotService.deleteTimeSlotsForBooking(bookingId).subscribe({
                next: () => {
                  // After time slots are deleted, delete the booking
                  this.delete(bookingId).subscribe({
                    next() {
                      subscriber.next();
                      subscriber.complete();
                    },
                    error(error) {
                      subscriber.error(error);
                    },
                  });
                },
                error(error) {
                  subscriber.error(error);
                },
              });
            },
            error(error) {
              subscriber.error(error);
            },
          });
        },
        error(error) {
          subscriber.error(error);
        },
      });
    });
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

  validateBookingData(bookingData: {
    selectedDate: string;
    selectedActivity: string;
    selectedEvent: string;
    selectedPartySize: number | null;
    selectedTimeSlots: string[];
  }): string | null {
    if (!bookingData.selectedDate) {
      return 'Please select a date';
    }

    if (!bookingData.selectedActivity) {
      return 'Please select an activity';
    }

    if (!bookingData.selectedEvent) {
      return 'Please select an event';
    }

    if (!bookingData.selectedPartySize) {
      return 'Please select party size';
    }

    if (bookingData.selectedTimeSlots.length === 0) {
      return 'Please select at least one time slot';
    }

    return null;
  }

  createBookingWithTimeSlots(
    bookingData: {
      selectedDate: string;
      selectedActivity: string;
      selectedEvent: string;
      selectedPartySize: number | null;
      selectedTimeSlots: string[];
      selectedSocialActivity: string;
      currentUserProfile: IProfile;
      activities: any[];
      loadedActivities: IActivity[];
    },
    timeSlotService: TimeSlotService,
  ): Observable<{ success: boolean; error?: string }> {
    return new Observable(subscriber => {
      const selectedEventId = this.eventService.findEventIdByValue(bookingData.selectedEvent, bookingData.activities);
      const timeSlots: ITimeSlot[] = [];
      let processedCount = 0;

      const selectedDateString = bookingData.selectedDate;
      const formattedDateStr = dayjs(selectedDateString).format('YYYY-MM-DD');
      const bookingDate = dayjs(formattedDateStr);

      const createNextTimeSlot = (index: number): void => {
        if (index >= bookingData.selectedTimeSlots.length) {
          if (timeSlots.length > 0) {
            // Find the selected social activity if one is selected
            let bookedActivity: IActivity | null = null;
            if (bookingData.selectedSocialActivity.startsWith('activity-')) {
              const activityId = Number(bookingData.selectedSocialActivity.replace('activity-', ''));
              bookedActivity = bookingData.loadedActivities.find(act => act.id === activityId) ?? null;
            }

            const booking: NewBooking = {
              id: null,
              activityType: bookingData.selectedActivity as keyof typeof ActivityType,
              eventType: bookingData.selectedEvent.toUpperCase() as keyof typeof EventType,
              bookingDate: dayjs(selectedDateString),
              partySize: bookingData.selectedPartySize ?? 1,
              bookingStatus: 'CONFIRMED' as const,
              createdAt: dayjs(),
              timeSlot: timeSlots[0],
              assignedAt: null,
              bookedActivity,
              bookingLocation: null,
              creator: { id: bookingData.currentUserProfile.id },
              activity: null,
            };

            const locationTypeName = this.getLocationTypeFromEvent(bookingData.selectedEvent);
            const requiredCapacity = bookingData.selectedPartySize ?? 1;

            const firstTimeSlot = timeSlots[0];
            const startHour = firstTimeSlot.startHour;
            const endHour = firstTimeSlot.endHour;
            const bookingDateStr =
              typeof firstTimeSlot.date === 'string' ? firstTimeSlot.date : dayjs(firstTimeSlot.date).format('YYYY-MM-DD');

            this.http
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

                  if (matchingLocations.length === 0) {
                    subscriber.next({ success: false, error: `No available locations found for ${locationTypeName}` });
                    subscriber.complete();
                    return;
                  }

                  this.http
                    .get<any[]>('api/time-slots', {
                      params: {
                        'date.equals': bookingDateStr,
                      },
                    })
                    .subscribe({
                      next: existingTimeSlots => {
                        const conflictingTimeSlots = existingTimeSlots.filter((slot: any) => {
                          const slotDate = typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD');
                          return (
                            slotDate === bookingDateStr &&
                            slot.startHour === startHour &&
                            slot.endHour === endHour &&
                            Boolean(slot.location) &&
                            Boolean(slot.location.id)
                          );
                        });

                        const bookedLocationIds = conflictingTimeSlots.map((slot: any) => Number(slot.location.id)).filter(Boolean);
                        const availableLocations = matchingLocations.filter(loc => !bookedLocationIds.includes(loc.id));

                        if (availableLocations.length === 0) {
                          subscriber.next({
                            success: false,
                            error: `All ${locationTypeName} locations are already booked for the selected date and time`,
                          });
                          subscriber.complete();
                          return;
                        }

                        let locationsAvailableForAllSlots: any[] = [...availableLocations];

                        if (bookingData.selectedTimeSlots.length > 1) {
                          for (let i = 1; i < bookingData.selectedTimeSlots.length; i++) {
                            const additionalSlot = bookingData.selectedTimeSlots[i];
                            const parsedAdditionalSlot = timeSlotService.parseTimeSlot(additionalSlot);
                            const additionalStartHour = parsedAdditionalSlot.start;
                            const additionalEndHour = parsedAdditionalSlot.end;

                            const additionalConflictingTimeSlots = existingTimeSlots.filter((slot: any) => {
                              const slotDate = typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD');
                              return (
                                slotDate === bookingDateStr &&
                                slot.startHour === additionalStartHour &&
                                slot.endHour === additionalEndHour &&
                                Boolean(slot.location) &&
                                Boolean(slot.location.id)
                              );
                            });

                            const additionalBookedLocationIds = additionalConflictingTimeSlots
                              .map((slot: any) => Number(slot.location.id))
                              .filter(Boolean);

                            locationsAvailableForAllSlots = locationsAvailableForAllSlots.filter(
                              loc => !additionalBookedLocationIds.includes(loc.id),
                            );
                          }
                        }

                        if (locationsAvailableForAllSlots.length === 0) {
                          subscriber.next({
                            success: false,
                            error: `No ${locationTypeName} locations are available for all selected time slots`,
                          });
                          subscriber.complete();
                          return;
                        }

                        const availableLocation = locationsAvailableForAllSlots[0];
                        if (availableLocation) {
                          booking.bookingLocation = { id: availableLocation.id };
                        }

                        this.create(booking).subscribe({
                          next(response) {
                            const bookingId = response.body?.id;
                            if (bookingId) {
                              timeSlotService.updateTimeSlotsWithBookingId(timeSlots, bookingId, availableLocation?.id);
                            }
                            subscriber.next({ success: true });
                            subscriber.complete();
                          },
                          error(error) {
                            subscriber.next({
                              success: false,
                              error: error.error?.detail || error.error?.message || 'Failed to create booking',
                            });
                            subscriber.complete();
                          },
                        });
                      },
                      error(error) {
                        subscriber.next({ success: false, error: 'Error checking time slot availability' });
                        subscriber.complete();
                      },
                    });
                },
                error(error) {
                  subscriber.next({ success: false, error: 'Error loading available locations' });
                  subscriber.complete();
                },
              });
          } else {
            subscriber.next({ success: false, error: 'Failed to create any time slots for booking.' });
            subscriber.complete();
          }
          return;
        }

        const currentSlot = bookingData.selectedTimeSlots[index];
        const parsedSlot = timeSlotService.parseTimeSlot(currentSlot);

        let eventCapacity = null;
        for (const activity of bookingData.activities) {
          const foundEvent = activity.events.find((e: any) => e.value === bookingData.selectedEvent);
          if (foundEvent) {
            eventCapacity = foundEvent.capacity;
            break;
          }
        }

        const timeSlotDateString = formattedDateStr;

        const newTimeSlot = {
          date: timeSlotDateString,
          startHour: parsedSlot.start,
          endHour: parsedSlot.end,
          capacity: eventCapacity,
          remainingCapacity: eventCapacity !== null ? eventCapacity : 10,
          status: 'AVAILABLE',
          event: { id: selectedEventId },
          booking: null,
        };

        this.http.post<ITimeSlot>('api/time-slots', newTimeSlot).subscribe({
          next(savedTimeSlot) {
            timeSlots.push(savedTimeSlot);
            processedCount++;
            createNextTimeSlot(index + 1);
          },
          error(error) {
            console.error(`Error creating time slot for ${currentSlot}`, error);
            processedCount++;
            createNextTimeSlot(index + 1);
          },
        });
      };

      createNextTimeSlot(0);
    });
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
