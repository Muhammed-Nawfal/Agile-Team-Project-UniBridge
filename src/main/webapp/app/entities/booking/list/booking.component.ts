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
  fullyBookedTimeSlots: string[] = []; // Track fully booked time slots

  readonly MAX_SLOTS = 3;
  bookingError: string | null = null;

  // Upcoming activities (will be replaced with user's bookings)
  upcomingBookings: any[] = [];
  isLoadingBookings = false;

  currentLanguage: 'en' | 'es' = 'en';
  translations: Record<'en' | 'es', Record<string, string>> = {
    en: {
      booking: 'Booking',
      selectDate: 'Select a Date',
      selectActivity: 'Select an Activity',
      selectEvent: 'Select an Event',
      selectPartySize: 'Select Party Size',
      selectTime: 'Select Time',
      bookNow: 'Book Now',
      upcomingActivities: 'Upcoming Bookings',
      time: 'Time',
      defaultActivity: 'Activities',
      defaultEvent: 'Events',
      defaultPartySize: 'Party Size',
      noBookings: 'You have no upcoming bookings',
    },
    es: {
      booking: 'Reserva',
      selectDate: 'Seleccionar Fecha',
      selectActivity: 'Seleccionar Actividad',
      selectEvent: 'Seleccionar Evento',
      selectPartySize: 'Seleccionar Capacidad',
      selectTime: 'Seleccionar Hora',
      bookNow: 'Reservar Ahora',
      upcomingActivities: 'Tus Próximas Reservas',
      time: 'Hora',
      defaultActivity: 'Actividades',
      defaultEvent: 'Eventos',
      defaultPartySize: 'Capacidad',
      noBookings: 'No tienes reservas próximas',
    },
  };

  constructor(
    private http: HttpClient,
    private bookingService: BookingService,
    private accountService: AccountService,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadUserBookings();
  }

  // New method to load user bookings
  loadUserBookings(): void {
    this.isLoadingBookings = true;

    // First, load actual locations from the database
    this.http.get<any[]>('api/locations').subscribe({
      next: locations => {
        console.log('Loaded locations from database:', locations);

        // Now fetch bookings
        const today = dayjs().format('YYYY-MM-DD');
        const params = new HttpParams().set('bookingDate.greaterThanOrEqual', today).set('sort', 'bookingDate,asc');

        this.http.get<IBooking[]>('api/bookings', { params }).subscribe({
          next: bookings => {
            console.log('Raw bookings data:', bookings);

            // Reset array to ensure clean data
            this.upcomingBookings = [];

            // Process bookings for display with very clear logging
            const processedBookings = bookings.map(booking => {
              // Format time info
              let timeInfo = 'TBD';
              if (booking.timeSlot?.startHour !== undefined && booking.timeSlot.endHour !== undefined) {
                const startHour = booking.timeSlot.startHour!.toString().padStart(2, '0');
                const endHour = booking.timeSlot.endHour!.toString().padStart(2, '0');
                timeInfo = `${startHour}:00 - ${endHour}:00`;
              }

              const formattedDate = booking.bookingDate ? dayjs(booking.bookingDate).format('MMM DD') : '';

              let locationName = '';

              if (booking.bookingLocation?.id) {
                const matchedLocation = locations.find(loc => loc.id === booking.bookingLocation?.id);
                if (matchedLocation?.name) {
                  locationName = matchedLocation.name;
                  console.log(`Found location directly from booking: ${locationName}`);
                }
              } else if (booking.timeSlot?.location?.id) {
                const matchedLocation = locations.find(loc => loc.id === booking.timeSlot?.location?.id);
                if (matchedLocation?.name) {
                  locationName = matchedLocation.name;
                  console.log(`Found location from time slot: ${locationName}`);
                }
              }
              // If still not found, find location based on event type
              else if (booking.eventType) {
                const locationType = this.getLocationTypeFromEvent(booking.eventType);
                console.log(`Looking for locations matching type: ${locationType}`);

                // Find all locations of this type
                const matchingLocations = locations.filter(loc => loc.name?.startsWith(locationType));

                if (matchingLocations.length > 0) {
                  // Use the first matching location as fallback
                  locationName = matchingLocations[0].name;
                  console.log(`Found matching location by type: ${locationName}`);
                } else {
                  // Last resort - just use the location type
                  locationName = locationType + ' 1';
                  console.log(`Using derived location name: ${locationName}`);
                }
              }

              // Ensure we always have a location name
              if (!locationName) {
                locationName = 'Venue';
                console.log(`Using default venue name`);
              }

              console.log(`Booking ${booking.id} assigned location: ${locationName}`);

              // Create the booking object with explicit property assignments
              const processedBooking = {
                id: booking.id,
                name: booking.eventType ?? 'Booking',
                time: timeInfo,
                date: formattedDate,
                status: booking.bookingStatus,
                locationName, // This should definitely have a value now
              };

              // Log the full processed booking object
              console.log('Processed booking object:', JSON.stringify(processedBooking));

              return processedBooking;
            });

            // Use the processed bookings and limit to 5
            this.upcomingBookings = processedBookings.slice(0, 8);

            this.isLoadingBookings = false;
            console.log('Final upcoming bookings array:', this.upcomingBookings);

            // Debug the final output to console in a format that matches the display
            this.upcomingBookings.forEach(booking => {
              console.log(`${booking.name} on ${booking.date} | ${booking.locationName}`);
            });

            // Force detection of changes (in case that's an issue)
            setTimeout(() => {
              console.log(
                'Verifying upcomingBookings after timeout:',
                this.upcomingBookings.map(b => String(b.locationName || '')).join(', '),
              );

              // Add this check to ensure the location name is set
              this.upcomingBookings.forEach(booking => {
                if (!booking.locationName || booking.locationName === 'TBD') {
                  console.error(`Booking ${booking.id} has missing or TBD location!`);

                  // Force override any TBD values as a last resort
                  if (booking.name) {
                    // Convert from event type to location
                    const typeName = this.getLocationTypeFromEvent(booking.name);
                    // Convert number to string explicitly before concatenation
                    const locationNumber = Math.max(1, booking.id % 5).toString();
                    booking.locationName = typeName + ' ' + locationNumber;
                    console.log(`Forced location name update: ${booking.locationName}`);
                  }
                }
              });

              // Add additional debug logging for final state
              console.log('FINAL CHECK - Upcoming bookings with locations:');
              this.upcomingBookings.forEach(booking => {
                console.log(`Booking ID ${booking.id}: name=${booking.name}, locationName=${booking.locationName}`);
              });
            }, 100);
          },
          error: error => {
            console.error('Error loading bookings', error);
            this.isLoadingBookings = false;
            this.upcomingBookings = [];
          },
        });
      },
      error: error => {
        console.error('Error loading locations:', error);
        this.isLoadingBookings = false;
      },
    });
  }

  loadEvents(): void {
    this.http.get<IEvent[]>('api/events').subscribe({
      next: events => {
        // Group events by activity type
        const activityGroups = this.groupEventsByActivityType(events);
        this.activities = activityGroups;
      },
      error: error => {
        console.error('Error loading events', error);
        this.bookingError = 'Unable to load activities. Please try again later.';
        this.activities = []; // Initialize with empty array
      },
    });
  }

  groupEventsByActivityType(events: IEvent[]): any[] {
    // Create a map to group events by activity type
    const activityMap = new Map<string, any>();

    // Initialize activity types from ActivityType enum
    Object.values(ActivityType).forEach(type => {
      activityMap.set(type, {
        name: this.formatActivityType(type),
        value: type,
        events: [],
      });
    });

    // Group events by their activity type
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

    // Convert a map to array
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
    this.selectedTimeSlots = []; // Reset selected time slots when event changes
    this.fullyBookedTimeSlots = []; // Clear fully booked time slots when event changes

    // Get the selected event details
    let selectedEventObj = null;

    // Find the event in any activity
    for (const activity of this.activities) {
      const foundEvent = activity.events.find((e: { value: string }) => e.value === this.selectedEvent);
      if (foundEvent) {
        selectedEventObj = foundEvent;
        break;
      }
    }

    if (selectedEventObj) {
      // Update party sizes
      this.partySizes = [];
      for (let i = selectedEventObj.min; i <= selectedEventObj.max; i++) {
        this.partySizes.push(i);
      }

      // Generate UI time slots
      this.generateTimeSlots(selectedEventObj.startTime, selectedEventObj.endTime);

      // If we have a date selected, also fetch the available time slots from DB
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
        this.generateTimeSlots(eventObj.startTime, eventObj.endTime);
        // Fetch available time slots from the database
        this.fetchAvailableTimeSlots();
      }
    }
  }

  generateTimeSlots(startTime: number, endTime: number): void {
    this.timeSlots = [];
    const actualEndTime = endTime === 24 ? 24 : endTime;

    for (let hour = startTime; hour < actualEndTime; hour++) {
      const startHour = hour.toString().padStart(2, '0');
      const endHour = hour + 1 > 23 ? '00' : (hour + 1).toString().padStart(2, '0');
      const timeSlot = `${startHour}:00 - ${endHour}:00`;
      this.timeSlots.push(timeSlot);
    }
  }

  isTimeSlotDisabled(slot: string): boolean {
    // If no slots selected yet, all slots are enabled
    if (this.selectedTimeSlots.length === 0) {
      return false;
    }

    // If this slot is already selected, it's not disabled
    if (this.selectedTimeSlots.includes(slot)) {
      return false;
    }

    // If we already have MAX_SLOTS selected, disable all other slots
    if (this.selectedTimeSlots.length >= this.MAX_SLOTS) {
      return true;
    }

    // Check if this slot is adjacent to any selected slot
    const slotTime = this.parseTimeSlot(slot);

    for (const selectedSlot of this.selectedTimeSlots) {
      const selectedTime = this.parseTimeSlot(selectedSlot);

      // If this slot starts when a selected slot ends or ends when a selected slot starts
      if (slotTime.start === selectedTime.end || slotTime.end === selectedTime.start) {
        return false;
      }
    }

    // If not adjacent to any selected slot, disable it
    return true;
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

      // Add the slot to selected slots
      if (!this.selectedTimeSlots.includes(value)) {
        this.selectedTimeSlots.push(value);
        // Use a different approach to sort
        this.selectedTimeSlots.sort((a, b) => this.compareTimeSlots(a, b));
      }
    } else {
      // When unchecking, we need to ensure we don't break continuity
      const index = this.selectedTimeSlots.indexOf(value);
      if (index === 0 || index === this.selectedTimeSlots.length - 1) {
        // If removing the first or last slot, that's fine
        this.selectedTimeSlots = this.selectedTimeSlots.filter(slot => slot !== value);
      } else {
        // If removing a middle slot, that would break continuity - prevent it
        event.target.checked = true;
        this.bookingError = 'You can only remove slots from the beginning or end of your booking';
        return;
      }
    }
    this.bookingError = null;
  }

  // Helper function to compare time slots for sorting
  compareTimeSlots = (a: string, b: string): number => {
    const timeA = this.parseTimeSlot(a);
    const timeB = this.parseTimeSlot(b);
    return timeA.start - timeB.start;
  };

  // Helper function to parse time slot strings like "09:00-10:00"
  parseTimeSlot(timeSlot: string): { start: number; end: number } {
    const [startStr, endStr] = timeSlot.split(' - ');
    const startHour = parseInt(startStr.split(':')[0], 10);
    const endHour = parseInt(endStr.split(':')[0], 10) || 24; // Handle midnight "00:00" as 24

    return { start: startHour, end: endHour };
  }

  areSelectedSlotsConsecutive(): boolean {
    if (this.selectedTimeSlots.length <= 1) {
      return true;
    }

    // Sort selected slots by start time
    const sortedSlots = [...this.selectedTimeSlots].sort((a, b) => this.compareTimeSlots(a, b));

    // Check if each slot is consecutive with the next one
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentSlot = this.parseTimeSlot(sortedSlots[i]);
      const nextSlot = this.parseTimeSlot(sortedSlots[i + 1]);

      // If the end time of the current slot doesn't match start time of next slot
      if (currentSlot.end !== nextSlot.start) {
        return false;
      }
    }

    return true;
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

    if (!this.areSelectedSlotsConsecutive()) {
      this.bookingError = 'Please select consecutive time slots only';
      return false;
    }

    return true;
  }

  // Helper method to find event ID by value - make sure we match the EVENT_VALUE column
  findEventIdByValue(eventValue: string): number | undefined {
    // Debug what we have in our activities array
    console.log('Looking for event:', eventValue);
    console.log('Available activities:', this.activities);

    // Log all event values for debugging
    const allEventValues: string[] = [];
    this.activities.forEach(activity => {
      activity.events.forEach((event: any) => {
        allEventValues.push(event.value);
        // Add debug info with IDs to help troubleshoot
        console.log(`Event: ${event.value}, ID: ${event.id}, Name: ${event.name}`);
      });
    });
    console.log('All available event values:', allEventValues);

    // Try to find an exact match first
    for (const activity of this.activities) {
      const foundEvent = activity.events.find((e: any) => e.value === eventValue);
      if (foundEvent?.id) {
        console.log('Found exact match for event:', eventValue, 'with ID:', foundEvent.id);
        return foundEvent.id as number;
      }
    }

    // If no exact match, try case-insensitive or normalized matching
    for (const activity of this.activities) {
      const foundEvent = activity.events.find((e: any) => {
        // Try case-insensitive comparison
        return e.value.toLowerCase() === eventValue.toLowerCase();
      });

      if (foundEvent?.id) {
        console.log('Found case-insensitive match for event:', eventValue, 'with value:', foundEvent.value, 'and ID:', foundEvent.id);
        return foundEvent.id as number;
      }
    }

    // Try matching by name as a last resort
    for (const activity of this.activities) {
      const foundEvent = activity.events.find((e: any) => {
        // Try matching against the name field (which might be what the UI is using)
        return e.name.replace(/\s+/g, '_') === eventValue;
      });

      if (foundEvent?.id) {
        console.log('Found match by converted name for event:', eventValue, 'with ID:', foundEvent.id);
        return foundEvent.id as number;
      }
    }

    // Hardcoded fallback based on seed data (only as last resort)
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

    // No match found after trying all approaches
    console.error('Could not find event ID for:', eventValue, 'in available events');
    return undefined;
  }

  // Fetch time slots - update to use the event ID correctly
  fetchAvailableTimeSlots(): void {
    if (!this.selectedDate || !this.selectedEvent) {
      return;
    }

    // Clear fully booked time slots when fetching new data
    this.fullyBookedTimeSlots = [];

    // Ensure consistent date format with startOf('day')
    const bookingDate = dayjs(this.selectedDate).startOf('day');
    const formattedDate = bookingDate.format('YYYY-MM-DD');

    // Get the event ID for the selected event (this connects to EVENT_ID column)
    const eventId = this.findEventIdByValue(this.selectedEvent);

    // Create query - use event.id.equals to match the EVENT_ID column
    const params: any = {
      'date.equals': formattedDate,
    };

    // Add event ID filter if we found one
    if (eventId) {
      params['event.id.equals'] = eventId;
    }

    console.log(`Fetching time slots with date=${formattedDate} and eventId=${eventId ?? 'not found'}`);

    // Call the time slot service to get matching time slots
    this.http.get<ITimeSlot[]>('api/time-slots', { params }).subscribe({
      next: response => {
        // Store time slots
        this.availableTimeSlots = response;

        // Log what we got
        console.log(
          `Available time slots for date ${formattedDate}${eventId ? ' and event ID ' + String(eventId) : ''}:`,
          this.availableTimeSlots,
        );

        // Check if we have time slots with valid IDs
        if (this.availableTimeSlots.length === 0) {
          console.warn(
            `No time slots found for date ${formattedDate}${eventId ? ' and event ID ' + String(eventId) : ''}. Trying with just date...`,
          );

          // Try again with just date if we don't find any
          if (eventId) {
            const dateOnlyParams = { 'date.equals': formattedDate };
            this.http.get<ITimeSlot[]>('api/time-slots', { params: dateOnlyParams }).subscribe({
              next: dateResponse => {
                this.availableTimeSlots = dateResponse;
                console.log(`All time slots for date ${formattedDate}:`, this.availableTimeSlots);

                if (this.availableTimeSlots.length === 0) {
                  console.error(`No time slots found for date ${formattedDate}. Make sure time slots are generated for this date.`);
                } else {
                  // Check for fully booked time slots
                  this.checkForFullyBookedTimeSlots();
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
            // Check for fully booked time slots
            this.checkForFullyBookedTimeSlots();
          }
        }
      },
      error: error => {
        console.error('Error fetching time slots:', error);
        this.bookingError = 'Could not load time slots. Please try again.';
      },
    });
  }

  /**
   * Checks if a time slot is fully booked based on remainingCapacity
   * and location availability
   */
  checkForFullyBookedTimeSlots(): void {
    // Clear fully booked time slots before recalculating
    this.fullyBookedTimeSlots = [];

    // Get location type for the selected event
    const locationTypeName = this.getLocationTypeFromEvent(this.selectedEvent);

    // Get event capacity
    let eventCapacity = null;
    for (const activity of this.activities) {
      const foundEvent = activity.events.find((e: any) => e.value === this.selectedEvent);
      if (foundEvent) {
        eventCapacity = foundEvent.capacity;
        break;
      }
    }

    // Format the selected date to match database format
    const formattedSelectedDate = dayjs(this.selectedDate).format('YYYY-MM-DD');

    // Get all matching locations for this event type
    this.http
      .get<any[]>('api/locations', {
        params: {
          'status.equals': 'AVAILABLE',
          'name.startsWith': locationTypeName,
        },
      })
      .subscribe({
        next: locations => {
          // Try partial matching, normalize spaces and underscores
          const matchingLocations = locations.filter(loc => {
            const locName = loc.name?.toLowerCase().replace(/_/g, ' ');
            const typeName = locationTypeName.toLowerCase().replace(/_/g, ' ');
            return locName?.includes(typeName);
          });

          // Find total number of available locations for this event type
          const totalAvailableLocations = matchingLocations.length;
          console.log(`Total available ${locationTypeName} locations: ${totalAvailableLocations}`);

          if (totalAvailableLocations === 0) {
            // If no locations available, all time slots are fully booked
            this.fullyBookedTimeSlots = [...this.timeSlots];
            return;
          }

          // For each UI time slot, check if all locations are already booked
          this.timeSlots.forEach(timeSlot => {
            const parsedSlot = this.parseTimeSlot(timeSlot);
            const startHour = parsedSlot.start;
            const endHour = parsedSlot.end;

            // Find time slots in our availableTimeSlots array that match this time AND date
            const matchingDBSlots = this.availableTimeSlots.filter(slot => {
              // Check if the slot has the same time
              const timeMatch = slot.startHour === startHour && slot.endHour === endHour;

              // Check if the slot has the same date
              const slotDate = typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD');
              const dateMatch = slotDate === formattedSelectedDate;

              // Check if the slot is for the current event
              const eventId = this.findEventIdByValue(this.selectedEvent);
              const eventMatch = slot.event?.id === eventId;

              // Only consider slots that match time, date AND event
              return timeMatch && dateMatch && eventMatch;
            });

            // Find how many locations are already booked for this time
            const bookedLocationsCount = matchingDBSlots.filter(slot => Boolean(slot.location?.id)).length;

            console.log(
              `Time slot ${timeSlot} on ${formattedSelectedDate} for event ${this.selectedEvent}: ${bookedLocationsCount} of ${totalAvailableLocations} locations booked`,
            );

            // If all locations are booked, or if the event is at capacity
            if (bookedLocationsCount >= totalAvailableLocations) {
              this.fullyBookedTimeSlots.push(timeSlot);
              console.log(
                `Time slot ${timeSlot} on ${formattedSelectedDate} for event ${this.selectedEvent} is fully booked (all locations taken)`,
              );
            }
          });
        },
        error(error) {
          console.error('Error checking location availability:', error);
        },
      });
  }

  /**
   * Checks if a time slot is fully booked and should be crossed out
   */
  isTimeSlotFullyBooked(timeSlot: string): boolean {
    return this.fullyBookedTimeSlots.includes(timeSlot);
  }

  findTimeSlotEntity(slotString: string): ITimeSlot | null {
    if (!this.availableTimeSlots.length || !this.selectedDate) {
      return null;
    }

    const parsedSlot = this.parseTimeSlot(slotString);
    const startHour = parsedSlot.start;
    const endHour = parsedSlot.end;

    // First get the selected event ID from our events list
    const selectedEventId = this.findEventIdByValue(this.selectedEvent);

    console.log(
      `Looking for time slot with startHour=${startHour}, endHour=${endHour}, event=${this.selectedEvent}, eventId=${selectedEventId}`,
    );

    // Format the selected date to match database format
    const formattedSelectedDate = dayjs(this.selectedDate).format('YYYY-MM-DD');

    console.log('Selected date:', this.selectedDate, 'formatted as:', formattedSelectedDate);
    console.log('All available time slots:', this.availableTimeSlots.length);

    // For debugging, log a few time slots to check their structure
    if (this.availableTimeSlots.length > 0) {
      console.log('Sample time slot:', JSON.stringify(this.availableTimeSlots[0], null, 2));
    }

    // Initial check for any time slots that match our criteria
    const matchingTimeSlots = this.availableTimeSlots.filter(slot => {
      // Check if the date matches (this can be tricky due to formatting)
      const slotDate = typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD');
      const dateMatch = slotDate === formattedSelectedDate;

      // Check if hours match
      const hoursMatch = slot.startHour === startHour && slot.endHour === endHour;

      // Check if event ID matches (if we have one)
      const eventIdMatch = selectedEventId ? slot.event?.id === selectedEventId : true;

      return dateMatch && hoursMatch && eventIdMatch;
    });

    console.log(`Found ${matchingTimeSlots.length} time slots matching all criteria`);

    // If we found exact matches, use the first one
    if (matchingTimeSlots.length > 0) {
      console.log('Using exact match time slot:', matchingTimeSlots[0]);
      return matchingTimeSlots[0];
    }

    // If no exact match, look for time slots that match just by date and event ID
    if (selectedEventId) {
      const dateAndEventSlots = this.availableTimeSlots.filter(slot => {
        const slotDate = typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD');
        return slotDate === formattedSelectedDate && slot.event?.id === selectedEventId;
      });

      console.log(`Found ${dateAndEventSlots.length} time slots matching date and event ID`);

      if (dateAndEventSlots.length > 0) {
        // Try to find a time slot with matching hours first
        const timeMatch = dateAndEventSlots.find(slot => slot.startHour === startHour);
        if (timeMatch) {
          console.log('Found time slot matching date, event ID and start hour:', timeMatch);
          return timeMatch;
        }

        // Otherwise, use the first one
        console.log('Using first time slot matching date and event ID:', dateAndEventSlots[0]);
        return dateAndEventSlots[0];
      }
    }

    // Last resort: check if we have any time slots with the right date
    const dateOnlySlots = this.availableTimeSlots.filter(slot => {
      const slotDate = typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD');
      return slotDate === formattedSelectedDate;
    });

    console.log(`Found ${dateOnlySlots.length} time slots matching only date`);

    if (dateOnlySlots.length > 0) {
      console.log('Using time slot matching only date:', dateOnlySlots[0]);
      return dateOnlySlots[0];
    }

    // If we reach here, we couldn't find a suitable time slot
    console.error('No matching time slot found');
    return null;
  }

  // Helper to normalize event names for comparison
  normalizeEventName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^\w]/g, ''); // Remove non-word chars
  }

  createBookingWithNewTimeSlot(): NewBooking {
    // Get the first selected time slot from the array
    const firstSelectedSlot = this.selectedTimeSlots.length > 0 ? this.selectedTimeSlots[0] : null;
    const parsedSlot = this.parseTimeSlot(firstSelectedSlot!);

    // Get event ID
    const selectedEventId = this.findEventIdByValue(this.selectedEvent);

    // Create a new time slot object (without ID since backend will create it)
    const newTimeSlot: Omit<ITimeSlot, 'id'> = {
      date: dayjs(this.selectedDate),
      startHour: parsedSlot.start,
      endHour: parsedSlot.end,
      capacity: null,
      remainingCapacity: null,
      status: null,
      event: { id: selectedEventId } as any,
    };

    const booking: NewBooking = {
      id: null,
      activityType: this.selectedActivity as keyof typeof ActivityType,
      eventType: this.selectedEvent.toUpperCase() as keyof typeof EventType,
      bookingDate: dayjs(this.selectedDate),
      partySize: this.selectedPartySize ?? 1,
      bookingStatus: 'CONFIRMED' as keyof typeof BookingStatus,
      createdAt: dayjs(),
      timeSlot: newTimeSlot as ITimeSlot,
      // Other required fields
      assignedAt: null,
      bookedActivity: null,
      bookingLocation: null,
      creator: null,
      activity: null,
    };

    console.log('Created booking with new time slot');
    return booking;
  }

  onSubmit(): void {
    if (!this.validateBookingData()) {
      return;
    }

    const selectedEventId = this.findEventIdByValue(this.selectedEvent);
    const timeSlots: ITimeSlot[] = [];
    let processedCount = 0;

    // Get the exact date string from input field to avoid timezone issues
    const selectedDateString = this.selectedDate;
    // Use ISO format YYYY-MM-DD to avoid any timezone shifts
    const formattedDateStr = dayjs(selectedDateString).format('YYYY-MM-DD');
    // Create the booking date object from the formatted string to ensure consistency
    const bookingDate = dayjs(formattedDateStr);

    console.log('Selected date string:', selectedDateString);
    console.log('Formatted date string:', formattedDateStr);
    console.log('Booking date to be used:', bookingDate.format('YYYY-MM-DD'));

    // First, create all time slots in the database
    const createNextTimeSlot = (index: number): void => {
      if (index >= this.selectedTimeSlots.length) {
        // All time slots have been created, now create a single booking
        if (timeSlots.length > 0) {
          // Create a booking with the first time slot
          const booking: NewBooking = {
            id: null,
            activityType: this.selectedActivity as keyof typeof ActivityType,
            eventType: this.selectedEvent.toUpperCase() as keyof typeof EventType,
            bookingDate, // Use consistent booking date
            partySize: this.selectedPartySize ?? 1,
            bookingStatus: 'CONFIRMED' as keyof typeof BookingStatus,
            createdAt: dayjs(),
            timeSlot: timeSlots[0], // Reference the first time slot
            assignedAt: null,
            bookedActivity: null,
            bookingLocation: null,
            creator: null,
            activity: null,
          };

          // Log the booking date to verify format before submitting
          console.log('Final booking date to be submitted:', booking.bookingDate?.format('YYYY-MM-DD') ?? 'undefined date');

          // After creating the booking but before creating time slots
          const locationTypeName = this.getLocationTypeFromEvent(this.selectedEvent);
          const requiredCapacity = this.selectedPartySize ?? 1;

          // Get first time slot details to check for conflicts
          const firstTimeSlot = timeSlots[0];
          const startHour = firstTimeSlot.startHour;
          const endHour = firstTimeSlot.endHour;
          const bookingDateStr =
            typeof firstTimeSlot.date === 'string' ? firstTimeSlot.date : dayjs(firstTimeSlot.date).format('YYYY-MM-DD');

          console.log(`Looking for available locations for ${locationTypeName} on ${bookingDateStr} from ${startHour}:00 to ${endHour}:00`);

          // First, find all matching locations for the event type
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

                // Try partial matching, normalize spaces and underscores
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

                // Log the exact date we're booking for to ensure we're filtering correctly
                console.log('Exact booking date we are checking conflicts for:', bookingDateStr);

                // Now get all existing time slots for the EXACT same date to check for location conflicts
                this.http
                  .get<any[]>('api/time-slots', {
                    params: {
                      'date.equals': bookingDateStr,
                      // We're only interested in conflicts on this specific date
                    },
                  })
                  .subscribe({
                    next: (existingTimeSlots: any[]) => {
                      console.log('All time slots for this date:', existingTimeSlots);

                      // Debug log exact dates of time slots to check matching
                      existingTimeSlots.forEach((slot: any) => {
                        console.log('Time slot date:', typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD'));
                      });

                      // Filter slots to match only our specific time range AND that have locations assigned
                      const conflictingTimeSlots = existingTimeSlots.filter((slot: any) => {
                        // Get date in consistent format
                        const slotDate = typeof slot.date === 'string' ? slot.date : dayjs(slot.date).format('YYYY-MM-DD');

                        // Make sure date matches EXACTLY
                        return (
                          slotDate === bookingDateStr &&
                          slot.startHour === startHour &&
                          slot.endHour === endHour &&
                          Boolean(slot.location) /* type-safe truthy check */ &&
                          Boolean(slot.location.id) /* check location has an ID */
                        );
                      });

                      console.log('Time slots with matching hours that have locations assigned:', conflictingTimeSlots);

                      // Get all location IDs that are already booked for this SPECIFIC time and date
                      const bookedLocationIds = conflictingTimeSlots
                        .map((slot: any) => Number(slot.location.id)) // Convert to number explicitly
                        .filter(Boolean); // Simple way to filter out any falsy values

                      console.log('Location IDs booked for this specific date and time:', bookedLocationIds);

                      // Filter out locations that are already booked for this date/time
                      const availableLocations = matchingLocations.filter(loc => !bookedLocationIds.includes(loc.id));

                      console.log('Available locations after filtering out booked ones:', availableLocations);

                      if (availableLocations.length === 0) {
                        console.error('All matching locations are already booked for this date/time');
                        this.bookingError = `All ${locationTypeName} locations are already booked for the selected date and time`;
                        return;
                      }

                      // MODIFIED: Check if any of our selected time slots have conflicts for the available locations
                      let locationsAvailableForAllSlots: any[] = [...availableLocations];

                      // Check each additional time slot (if there are multiple selected)
                      if (this.selectedTimeSlots.length > 1) {
                        console.log('Checking additional time slots for location conflicts...');

                        // For each time slot after the first one
                        for (let i = 1; i < this.selectedTimeSlots.length; i++) {
                          const additionalSlot = this.selectedTimeSlots[i];
                          const parsedAdditionalSlot = this.parseTimeSlot(additionalSlot);
                          const additionalStartHour = parsedAdditionalSlot.start;
                          const additionalEndHour = parsedAdditionalSlot.end;

                          console.log(`Checking conflicts for additional time slot: ${additionalStartHour}:00 - ${additionalEndHour}:00`);

                          // Filter existing time slots for this additional time slot
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

                          // Get location IDs that are booked for this additional time slot
                          const additionalBookedLocationIds = additionalConflictingTimeSlots
                            .map((slot: any) => Number(slot.location.id))
                            .filter(Boolean);

                          console.log('Additional booked location IDs:', additionalBookedLocationIds);

                          // Filter our available locations to only include those available for ALL time slots
                          locationsAvailableForAllSlots = locationsAvailableForAllSlots.filter(
                            loc => !additionalBookedLocationIds.includes(loc.id),
                          );

                          console.log(`Locations available for all slots so far: ${locationsAvailableForAllSlots.length}`);
                        }
                      }

                      // Now check if any locations are available for ALL selected time slots
                      if (locationsAvailableForAllSlots.length === 0) {
                        console.error('No locations available for all selected time slots');
                        this.bookingError = `No ${locationTypeName} locations are available for all selected time slots`;
                        return;
                      }

                      // Select the first available location that isn't booked for ANY of our time slots
                      const availableLocation = locationsAvailableForAllSlots[0];
                      console.log('Selected available location for all time slots:', availableLocation);

                      if (availableLocation) {
                        // Add location to booking
                        booking.bookingLocation = { id: availableLocation.id };
                      }

                      // Now create the booking with location assigned if found
                      this.bookingService.create(booking).subscribe({
                        next: response => {
                          console.log('Booking submitted successfully!', response);

                          // Now update all time slots to reference this booking
                          const bookingId = response.body?.id;
                          if (bookingId) {
                            // Update each time slot with reference to the booking
                            this.updateTimeSlotsWithBookingId(timeSlots, bookingId, availableLocation?.id);
                          } else {
                            console.error('Created booking but no ID was returned');
                            alert(`Booking created successfully with ${timeSlots.length} time slot(s)!`);
                            // Refresh the page after showing alert
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

      // Get current time slot
      const currentSlot = this.selectedTimeSlots[index];
      const parsedSlot = this.parseTimeSlot(currentSlot);

      // Find the selected event object to get its capacity
      let eventCapacity = null;
      for (const activity of this.activities) {
        const foundEvent = activity.events.find((e: any) => e.value === this.selectedEvent);
        if (foundEvent) {
          eventCapacity = foundEvent.capacity;
          break;
        }
      }

      console.log(`Using event capacity: ${eventCapacity} for time slot`);

      // IMPORTANT: Create the date string manually to ensure EXACT format match with booking
      // This avoids any timezone or formatting issues
      const timeSlotDateString = formattedDateStr; // Use the exact same formatted string

      // Create time slot with required non-null fields using explicitly formatted date
      const newTimeSlot = {
        date: timeSlotDateString, // Use exact string format instead of dayjs object
        startHour: parsedSlot.start,
        endHour: parsedSlot.end,
        capacity: eventCapacity !== null ? eventCapacity : 10, // Default to 10 if capacity not found
        remainingCapacity: eventCapacity !== null ? eventCapacity : 10, // Default to 10 if capacity not found
        status: 'AVAILABLE',
        event: { id: selectedEventId },
        booking: null, // Initialize with null, will be updated after booking creation
      };

      // Log the time slot date to verify format before submitting
      console.log(`Time slot date to be created for ${currentSlot}:`, newTimeSlot.date);

      // Save the time slot
      this.http.post<ITimeSlot>('api/time-slots', newTimeSlot).subscribe({
        next(savedTimeSlot) {
          console.log(`Time slot created for ${currentSlot}:`, savedTimeSlot);
          console.log(
            `Time slot date after save:`,
            typeof savedTimeSlot.date === 'string' ? savedTimeSlot.date : dayjs(savedTimeSlot.date).format('YYYY-MM-DD'),
          );
          timeSlots.push(savedTimeSlot);
          processedCount++;
          // Process next time slot
          createNextTimeSlot(index + 1);
        },
        error(error) {
          console.error(`Error creating time slot for ${currentSlot}`, error);
          processedCount++;
          // Continue with next time slot even if this one failed
          createNextTimeSlot(index + 1);
        },
      });
    };

    // Start creating time slots
    createNextTimeSlot(0);
  }

  /**
   * Updates time slots with reference to the booking ID
   * @param timeSlots Array of time slots to update
   * @param bookingId ID of the booking to reference
   * @param locationId Optional location ID to set for time slots
   */
  updateTimeSlotsWithBookingId(timeSlots: ITimeSlot[], bookingId: number, locationId?: number): void {
    let updatedCount = 0;

    timeSlots.forEach(timeSlot => {
      // Skip if no ID
      if (!timeSlot.id) {
        console.warn('Cannot update time slot without ID');
        return;
      }

      // Create updated time slot with booking reference and location reference if available
      const updatedTimeSlot = {
        ...timeSlot,
        booking: { id: bookingId },
        location: locationId ? { id: locationId } : null,
      };

      // Update the time slot
      this.http.put<ITimeSlot>(`api/time-slots/${timeSlot.id}`, updatedTimeSlot).subscribe({
        next() {
          console.log(
            `Successfully updated time slot ${timeSlot.id} with booking ${bookingId}${locationId ? ` and location ${locationId}` : ''}`,
          );
          updatedCount++;

          // When all are updated, show confirmation
          if (updatedCount === timeSlots.length) {
            alert(`Booking created successfully with ${timeSlots.length} time slot(s)!`);
            // Refresh the page after all time slots are updated
            window.location.reload();
          }
        },
        error(error) {
          console.error(`Error updating time slot ${timeSlot.id} with booking reference`, error);
          updatedCount++;

          // When all are processed, show confirmation even if some failed
          if (updatedCount === timeSlots.length) {
            alert(`Booking created but some time slots may not be properly linked.`);
            // Still refresh the page even if there were some errors
            window.location.reload();
          }
        },
      });
    });
  }

  getLocationTypeFromEvent(event: string): string {
    // Make sure event is uppercase for consistent switch matching
    const upperEvent = event.toUpperCase();

    // Log the event value for debugging
    console.log('Converting event type to location:', upperEvent);

    switch (upperEvent) {
      case 'EVENT_ROOMS':
        return 'Event Room'; // Singular to match database
      case 'STUDY_SPACES':
        return 'Study Space'; // Singular to match database
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
        // Replace ALL underscores with spaces, not just the first
        return event.replace(/_/g, ' ');
    }
  }
}
