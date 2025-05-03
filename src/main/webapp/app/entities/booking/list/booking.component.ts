/* eslint-disable no-console */

import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observer } from 'rxjs';
import { EventService } from 'app/entities/event/service/event.service';
import { IEvent } from 'app/entities/event/event.model';
import { BookingService } from 'app/entities/booking/service/booking.service';
import { IBooking, NewBooking } from 'app/entities/booking/booking.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { EventType } from 'app/entities/enumerations/event-type.model';
import { BookingStatus } from 'app/entities/enumerations/booking-status.model';
import dayjs from 'dayjs/esm';
import { ITimeSlot } from 'app/entities/time-slot/time-slot.model';
import { Observable } from 'rxjs';
import { AccountService } from 'app/core/auth/account.service';
import { TimeSlotService } from 'app/entities/time-slot/service/time-slot.service';

@Component({
  standalone: true,
  selector: 'jhi-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [RouterModule, FormsModule, CommonModule],
})
export class BookingComponent implements OnInit {
  activities: any[] = [];
  events: any[] = [];
  partySizes: number[] = [];
  timeSlots: string[] = [];
  selectedTimeSlots: string[] = [];
  showConfirmation = false;
  selectedDate = '';
  selectedActivity = '';
  selectedEvent = '';
  selectedPartySize: number | null = null;
  availableTimeSlots: ITimeSlot[] = [];
  fullyBookedTimeSlots: string[] = [];

  readonly MAX_SLOTS = 3;
  bookingError: string | null = null;

  upcomingBookings: any[] = [];
  isLoadingBookings = false;

  currentLanguage: 'en' | 'es' = 'en';
  translations: Record<'en' | 'es', Record<string, string>> = {
    en: {
      booking: 'BOOKING',
      selectDate: 'CHOOSE A DATE',
      selectActivity: 'SELECT AN ACTIVITY',
      selectEvent: 'SELECT AN EVENT',
      selectPartySize: 'PARTY SIZE',
      selectTime: 'TIME',
      bookNow: 'BOOK',
      upcomingActivities: 'UPCOMING',
      time: 'Time',
      defaultActivity: 'Select',
      defaultEvent: 'Select',
      defaultPartySize: 'SELECT',
      noBookings: 'NO BOOKINGS, MAKE ONE NOW',
    },
    es: {
      booking: 'RESERVA',
      selectDate: 'FECHA',
      selectActivity: 'ACTIVIDAD',
      selectEvent: 'EVENTO',
      selectPartySize: 'CAPACIDAD',
      selectTime: 'HORA',
      bookNow: 'RESERVA',
      upcomingActivities: 'PRÓXIMAS',
      time: 'HORA',
      defaultActivity: 'ACTIVIDADES',
      defaultEvent: 'EVENTOS',
      defaultPartySize: 'CAPACIDAD',
      noBookings: 'No tienes reservas próximas',
    },
  };

  constructor(
    private http: HttpClient,
    private bookingService: BookingService,
    private accountService: AccountService,
    private eventService: EventService,
    public timeSlotService: TimeSlotService,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadUserBookings();
  }

  loadUserBookings(): void {
    this.isLoadingBookings = true;

    this.bookingService.loadUserBookings().subscribe({
      next: bookings => {
        this.upcomingBookings = bookings;
        this.isLoadingBookings = false;
        console.log('Final upcoming bookings array:', this.upcomingBookings);
      },
      error: error => {
        console.error('Error loading bookings', error);
        this.isLoadingBookings = false;
      },
    });
  }

  loadEvents(): void {
    this.http.get<IEvent[]>('api/events').subscribe({
      next: events => {
        const activityGroups = this.groupEventsByActivityType(events);
        this.activities = activityGroups;
      },
      error: error => {
        console.error('Error loading events', error);
        this.bookingError = 'Unable to load activities. Please try again later.';
        this.activities = [];
      },
    });
  }

  groupEventsByActivityType(events: IEvent[]): any[] {
    const activityMap = new Map<string, any>();

    Object.values(ActivityType).forEach(type => {
      activityMap.set(type, {
        name: this.formatActivityType(type),
        value: type,
        events: [],
      });
    });

    events.forEach(event => {
      const activityType = event.activityType ?? '';
      const group = activityMap.get(activityType);

      if (group) {
        group.events.push({
          id: event.id,
          name: event.name,
          value: event.value,
          min: event.minSize,
          max: event.maxSize,
          startTime: event.startTime,
          endTime: event.endTime,
          capacity: event.capacity,
        });
      }
    });

    return Array.from(activityMap.values()).filter(group => group.events.length > 0);
  }

  formatActivityType(type: string): string {
    return type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ');
  }

  translate(key: string): string {
    return this.translations[this.currentLanguage][key];
  }

  changeLanguage(event: any): void {
    this.currentLanguage = event.target.value;
  }

  onActivityChange(event: any): void {
    this.selectedActivity = event.target.value;
    const selectedActivity = this.activities.find(act => act.value === this.selectedActivity);

    this.events = selectedActivity ? selectedActivity.events : [];
    this.partySizes = [];
    this.timeSlots = [];
    this.selectedTimeSlots = [];
  }

  onEventChange(event: any): void {
    this.selectedEvent = event.target.value;
    this.selectedTimeSlots = [];
    this.fullyBookedTimeSlots = [];

    let selectedEventObj = null;

    for (const activity of this.activities) {
      const foundEvent = activity.events.find((e: { value: string }) => e.value === this.selectedEvent);
      if (foundEvent) {
        selectedEventObj = foundEvent;
        break;
      }
    }

    if (selectedEventObj) {
      this.partySizes = [];
      for (let i = selectedEventObj.min; i <= selectedEventObj.max; i++) {
        this.partySizes.push(i);
      }

      this.timeSlots = this.timeSlotService.generateTimeSlots(selectedEventObj.startTime, selectedEventObj.endTime);

      if (this.selectedDate) {
        this.fetchAvailableTimeSlots();
      }
    } else {
      this.partySizes = [];
      this.timeSlots = [];
    }
  }

  onPartySizeChange(event: any): void {
    this.selectedPartySize = Number(event.target.value);
  }

  onDateChange(event: any): void {
    this.selectedDate = event.target.value;

    if (this.selectedDate && this.selectedActivity && this.selectedEvent) {
      const eventObj = this.events.find(e => e.value === this.selectedEvent);
      if (eventObj && eventObj.startTime !== undefined && eventObj.endTime !== undefined) {
        this.timeSlots = this.timeSlotService.generateTimeSlots(eventObj.startTime, eventObj.endTime);
        this.fetchAvailableTimeSlots();
      }
    }
  }

  onTimeSlotChange(event: any): void {
    const value = event.target.value;
    const checked = event.target.checked;

    if (checked) {
      if (this.selectedTimeSlots.length >= this.MAX_SLOTS) {
        event.target.checked = false;
        this.bookingError = `Maximum booking duration is ${this.MAX_SLOTS} hours`;
        return;
      }

      if (!this.selectedTimeSlots.includes(value)) {
        this.selectedTimeSlots.push(value);
        this.selectedTimeSlots.sort((a, b) => this.timeSlotService.compareTimeSlots(a, b));
      }
    } else {
      const index = this.selectedTimeSlots.indexOf(value);
      if (index === 0 || index === this.selectedTimeSlots.length - 1) {
        this.selectedTimeSlots = this.selectedTimeSlots.filter(slot => slot !== value);
      } else {
        event.target.checked = true;
        this.bookingError = 'You can only remove slots from the beginning or end of your booking';
        return;
      }
    }
    this.bookingError = null;
  }

  validateBookingData(): boolean {
    if (!this.selectedDate) {
      this.bookingError = 'Please select a date';
      return false;
    }

    if (!this.selectedActivity) {
      this.bookingError = 'Please select an activity';
      return false;
    }

    if (!this.selectedEvent) {
      this.bookingError = 'Please select an event';
      return false;
    }

    if (!this.selectedPartySize) {
      this.bookingError = 'Please select party size';
      return false;
    }

    if (this.selectedTimeSlots.length === 0) {
      this.bookingError = 'Please select at least one time slot';
      return false;
    }

    if (!this.timeSlotService.areSelectedSlotsConsecutive(this.selectedTimeSlots)) {
      this.bookingError = 'Please select consecutive time slots only';
      return false;
    }

    return true;
  }

  fetchAvailableTimeSlots(): void {
    if (!this.selectedDate || !this.selectedEvent) {
      return;
    }

    this.fullyBookedTimeSlots = [];

    const bookingDate = dayjs(this.selectedDate).startOf('day');
    const formattedDate = bookingDate.format('YYYY-MM-DD');

    const eventId = this.eventService.findEventIdByValue(this.selectedEvent, this.activities);

    const params: any = {
      'date.equals': formattedDate,
    };

    if (eventId) {
      params['event.id.equals'] = eventId;
    }

    console.log(`Fetching time slots with date=${formattedDate} and eventId=${eventId ?? 'not found'}`);

    this.http.get<ITimeSlot[]>('api/time-slots', { params }).subscribe({
      next: response => {
        this.availableTimeSlots = response;

        console.log(
          `Available time slots for date ${formattedDate}${eventId ? ' and event ID ' + String(eventId) : ''}:`,
          this.availableTimeSlots,
        );

        if (this.availableTimeSlots.length === 0) {
          console.warn(
            `No time slots found for date ${formattedDate}${eventId ? ' and event ID ' + String(eventId) : ''}. Trying with just date...`,
          );

          if (eventId) {
            const dateOnlyParams = { 'date.equals': formattedDate };
            this.http.get<ITimeSlot[]>('api/time-slots', { params: dateOnlyParams }).subscribe({
              next: dateResponse => {
                this.availableTimeSlots = dateResponse;
                console.log(`All time slots for date ${formattedDate}:`, this.availableTimeSlots);

                if (this.availableTimeSlots.length === 0) {
                  console.error(`No time slots found for date ${formattedDate}. Make sure time slots are generated for this date.`);
                } else {
                  this.timeSlotService
                    .checkForFullyBookedTimeSlots(
                      this.timeSlots,
                      this.availableTimeSlots,
                      this.selectedDate,
                      this.selectedEvent,
                      this.activities,
                      this.eventService,
                      this.bookingService,
                      this.http,
                    )
                    .subscribe({
                      next: fullyBookedSlots => {
                        this.fullyBookedTimeSlots = fullyBookedSlots;
                      },
                      error(error) {
                        console.error('Error checking for fully booked time slots:', error);
                      },
                    });
                }
              },
            });
          } else {
            console.warn('No time slots found for the selected date. Make sure time slots are generated for this date.');
          }
        } else {
          const slotsWithIds = this.availableTimeSlots.filter(slot => slot.id);
          if (slotsWithIds.length === 0) {
            console.error('Time slots found but they have no IDs!');
          } else {
            console.log(`Found ${slotsWithIds.length} valid time slots with IDs`);
            this.timeSlotService
              .checkForFullyBookedTimeSlots(
                this.timeSlots,
                this.availableTimeSlots,
                this.selectedDate,
                this.selectedEvent,
                this.activities,
                this.eventService,
                this.bookingService,
                this.http,
              )
              .subscribe({
                next: fullyBookedSlots => {
                  this.fullyBookedTimeSlots = fullyBookedSlots;
                },
                error(error) {
                  console.error('Error checking for fully booked time slots:', error);
                },
              });
          }
        }
      },
      error: error => {
        console.error('Error fetching time slots:', error);
        this.bookingError = 'Could not load time slots. Please try again.';
      },
    });
  }

  onSubmit(): void {
    if (!this.validateBookingData()) {
      return;
    }

    const selectedEventId = this.eventService.findEventIdByValue(this.selectedEvent, this.activities);
    const timeSlots: ITimeSlot[] = [];
    let processedCount = 0;

    const selectedDateString = this.selectedDate;
    const formattedDateStr = dayjs(selectedDateString).format('YYYY-MM-DD');
    const bookingDate = dayjs(formattedDateStr);

    console.log('Selected date string:', selectedDateString);
    console.log('Formatted date string:', formattedDateStr);
    console.log('Booking date to be used:', bookingDate.format('YYYY-MM-DD'));

    const createNextTimeSlot = (index: number): void => {
      if (index >= this.selectedTimeSlots.length) {
        if (timeSlots.length > 0) {
          const booking: NewBooking = {
            id: null,
            activityType: this.selectedActivity as keyof typeof ActivityType,
            eventType: this.selectedEvent.toUpperCase() as keyof typeof EventType,
            bookingDate,
            partySize: this.selectedPartySize ?? 1,
            bookingStatus: 'CONFIRMED' as keyof typeof BookingStatus,
            createdAt: dayjs(),
            timeSlot: timeSlots[0],
            assignedAt: null,
            bookedActivity: null,
            bookingLocation: null,
            creator: null,
            activity: null,
          };

          console.log('Final booking date to be submitted:', booking.bookingDate?.format('YYYY-MM-DD') ?? 'undefined date');

          const locationTypeName = this.bookingService.getLocationTypeFromEvent(this.selectedEvent);
          const requiredCapacity = this.selectedPartySize ?? 1;

          const firstTimeSlot = timeSlots[0];
          const startHour = firstTimeSlot.startHour;
          const endHour = firstTimeSlot.endHour;
          const bookingDateStr =
            typeof firstTimeSlot.date === 'string' ? firstTimeSlot.date : dayjs(firstTimeSlot.date).format('YYYY-MM-DD');

          console.log(`Looking for available locations for ${locationTypeName} on ${bookingDateStr} from ${startHour}:00 to ${endHour}:00`);

          this.http
            .get<any[]>('api/locations', {
              params: {
                'status.equals': 'AVAILABLE',
                'name.startsWith': locationTypeName,
              },
            })
            .subscribe({
              next: locations => {
                console.log('All available locations:', locations);

                const matchingLocations = locations.filter(loc => {
                  const locName = loc.name?.toLowerCase().replace(/_/g, ' ');
                  const typeName = locationTypeName.toLowerCase().replace(/_/g, ' ');
                  return locName?.includes(typeName);
                });

                console.log('Filtered locations for', locationTypeName, ':', matchingLocations);

                if (matchingLocations.length === 0) {
                  console.error('No matching locations found for', locationTypeName);
                  this.bookingError = `No available locations found for ${locationTypeName}`;
                  return;
                }

                console.log('Exact booking date we are checking conflicts for:', bookingDateStr);

                this.http
                  .get<any[]>('api/time-slots', {
                    params: {
                      'date.equals': bookingDateStr,
                    },
                  })
                  .subscribe({
                    next: (existingTimeSlots: any[]) => {
                      console.log('All time slots for this date:', existingTimeSlots);

                      existingTimeSlots.forEach((slot: any) => {
                        console.log('Time slot date:', typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD'));
                      });

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

                      console.log('Time slots with matching hours that have locations assigned:', conflictingTimeSlots);

                      const bookedLocationIds = conflictingTimeSlots.map((slot: any) => Number(slot.location.id)).filter(Boolean);

                      console.log('Location IDs booked for this specific date and time:', bookedLocationIds);

                      const availableLocations = matchingLocations.filter(loc => !bookedLocationIds.includes(loc.id));

                      console.log('Available locations after filtering out booked ones:', availableLocations);

                      if (availableLocations.length === 0) {
                        console.error('All matching locations are already booked for this date/time');
                        this.bookingError = `All ${locationTypeName} locations are already booked for the selected date and time`;
                        return;
                      }

                      let locationsAvailableForAllSlots: any[] = [...availableLocations];

                      if (this.selectedTimeSlots.length > 1) {
                        console.log('Checking additional time slots for location conflicts...');

                        for (let i = 1; i < this.selectedTimeSlots.length; i++) {
                          const additionalSlot = this.selectedTimeSlots[i];
                          const parsedAdditionalSlot = this.timeSlotService.parseTimeSlot(additionalSlot);
                          const additionalStartHour = parsedAdditionalSlot.start;
                          const additionalEndHour = parsedAdditionalSlot.end;

                          console.log(`Checking conflicts for additional time slot: ${additionalStartHour}:00 - ${additionalEndHour}:00`);

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

                          console.log(`Found ${additionalConflictingTimeSlots.length} conflicting slots for additional time`);

                          const additionalBookedLocationIds = additionalConflictingTimeSlots
                            .map((slot: any) => Number(slot.location.id))
                            .filter(Boolean);

                          console.log('Additional booked location IDs:', additionalBookedLocationIds);

                          locationsAvailableForAllSlots = locationsAvailableForAllSlots.filter(
                            loc => !additionalBookedLocationIds.includes(loc.id),
                          );

                          console.log(`Locations available for all slots so far: ${locationsAvailableForAllSlots.length}`);
                        }
                      }

                      if (locationsAvailableForAllSlots.length === 0) {
                        console.error('No locations available for all selected time slots');
                        this.bookingError = `No ${locationTypeName} locations are available for all selected time slots`;
                        return;
                      }

                      const availableLocation = locationsAvailableForAllSlots[0];
                      console.log('Selected available location for all time slots:', availableLocation);

                      if (availableLocation) {
                        booking.bookingLocation = { id: availableLocation.id };
                      }

                      this.bookingService.create(booking).subscribe({
                        next: response => {
                          console.log('Booking submitted successfully!', response);

                          const bookingId = response.body?.id;
                          if (bookingId) {
                            this.timeSlotService.updateTimeSlotsWithBookingId(timeSlots, bookingId, availableLocation?.id);
                          } else {
                            console.error('Created booking but no ID was returned');
                            alert(`Booking created successfully with ${timeSlots.length} time slot(s)!`);
                            window.location.reload();
                          }

                          this.bookingError = null;
                        },
                        error: error => {
                          console.error('Error creating booking', error);
                          this.bookingError = error.error?.detail || error.error?.message || 'Failed to create booking';
                        },
                      });
                    },
                    error: error => {
                      console.error('Error checking existing time slots:', error);
                      this.bookingError = 'Error checking time slot availability';
                    },
                  });
              },
              error: error => {
                console.error('Error loading locations:', error);
                this.bookingError = 'Error loading available locations';
              },
            });
        } else {
          this.bookingError = 'Failed to create any time slots for booking.';
        }
        return;
      }

      const currentSlot = this.selectedTimeSlots[index];
      const parsedSlot = this.timeSlotService.parseTimeSlot(currentSlot);

      let eventCapacity = null;
      for (const activity of this.activities) {
        const foundEvent = activity.events.find((e: any) => e.value === this.selectedEvent);
        if (foundEvent) {
          eventCapacity = foundEvent.capacity;
          break;
        }
      }

      console.log(`Using event capacity: ${eventCapacity} for time slot`);

      const timeSlotDateString = formattedDateStr;

      const newTimeSlot = {
        date: timeSlotDateString,
        startHour: parsedSlot.start,
        endHour: parsedSlot.end,
        capacity: eventCapacity !== null ? eventCapacity : 10,
        remainingCapacity: eventCapacity !== null ? eventCapacity : 10,
        status: 'AVAILABLE',
        event: { id: selectedEventId },
        booking: null,
      };

      console.log(`Time slot date to be created for ${currentSlot}:`, newTimeSlot.date);

      this.http.post<ITimeSlot>('api/time-slots', newTimeSlot).subscribe({
        next(savedTimeSlot) {
          console.log(`Time slot created for ${currentSlot}:`, savedTimeSlot);
          console.log(
            `Time slot date after save:`,
            typeof savedTimeSlot.date === 'string' ? savedTimeSlot.date : dayjs(savedTimeSlot.date).format('YYYY-MM-DD'),
          );
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
  }
}
