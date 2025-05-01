/* eslint-disable no-console */

import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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

  readonly MAX_SLOTS = 3;
  bookingError: string | null = null;

  // Upcoming activities
  upcomingActivities = [
    { name: 'Basketball', icon: '🏀', time: '18:00 - 19:00' },
    { name: 'Swimming', icon: '🏊‍♂️', time: '17:00 - 18:00' },
    { name: 'Tennis', icon: '🎾', time: '16:00 - 17:00' },
  ];

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
      upcomingActivities: 'Upcoming Activities',
      time: 'Time',
      defaultActivity: 'Activities',
      defaultEvent: 'Events',
      defaultPartySize: 'Party Size',
    },
    es: {
      booking: 'Reserva',
      selectDate: 'Seleccionar Fecha',
      selectActivity: 'Seleccionar Actividad',
      selectEvent: 'Seleccionar Evento',
      selectPartySize: 'Seleccionar Capacidad',
      selectTime: 'Seleccionar Hora',
      bookNow: 'Reservar Ahora',
      upcomingActivities: 'Próximas Actividades',
      time: 'Hora',
      defaultActivity: 'Actividades',
      defaultEvent: 'Eventos',
      defaultPartySize: 'Capacidad',
    },
  };

  constructor(
    private http: HttpClient,
    private bookingService: BookingService,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
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

    // Format date for the backend
    const formattedDate = dayjs(this.selectedDate).format('YYYY-MM-DD');

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
          }
        }
      },
      error: error => {
        console.error('Error fetching time slots:', error);
        this.bookingError = 'Could not load time slots. Please try again.';
      },
    });
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

    // Create booking object with the new time slot
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
            bookingDate: dayjs(this.selectedDate),
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

          this.bookingService.create(booking).subscribe({
            next: response => {
              console.log('Booking submitted successfully!', response);

              // Now update all time slots to reference this booking
              const bookingId = response.body?.id;
              if (bookingId) {
                // Update each time slot with reference to the booking
                this.updateTimeSlotsWithBookingId(timeSlots, bookingId);
              } else {
                console.error('Created booking but no ID was returned');
                alert(`Booking created successfully with ${timeSlots.length} time slot(s)!`);
              }

              this.bookingError = null;
            },
            error: error => {
              console.error('Error creating booking', error);
              this.bookingError = error.error?.detail || error.error?.message || 'Failed to create booking';
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

      // Create time slot with required non-null fields
      const newTimeSlot = {
        date: dayjs(this.selectedDate),
        startHour: parsedSlot.start,
        endHour: parsedSlot.end,
        capacity: eventCapacity !== null ? eventCapacity : 10, // Default to 10 if capacity not found
        remainingCapacity: eventCapacity !== null ? eventCapacity : 10, // Default to 10 if capacity not found
        status: 'AVAILABLE',
        event: { id: selectedEventId },
        booking: null, // Initialize with null, will be updated after booking creation
      };

      // Save the time slot
      this.http.post<ITimeSlot>('api/time-slots', newTimeSlot).subscribe({
        next(savedTimeSlot) {
          console.log(`Time slot created for ${currentSlot}:`, savedTimeSlot);
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
   */
  updateTimeSlotsWithBookingId(timeSlots: ITimeSlot[], bookingId: number): void {
    let updatedCount = 0;

    timeSlots.forEach(timeSlot => {
      // Skip if no ID
      if (!timeSlot.id) {
        console.warn('Cannot update time slot without ID');
        return;
      }

      // Create updated time slot with booking reference
      const updatedTimeSlot = {
        ...timeSlot,
        booking: { id: bookingId },
      };

      // Update the time slot
      this.http.put<ITimeSlot>(`api/time-slots/${timeSlot.id}`, updatedTimeSlot).subscribe({
        next() {
          console.log(`Successfully updated time slot ${timeSlot.id} with booking ${bookingId}`);
          updatedCount++;

          // When all are updated, show confirmation
          if (updatedCount === timeSlots.length) {
            alert(`Booking created successfully with ${timeSlots.length} time slot(s)!`);
          }
        },
        error(error) {
          console.error(`Error updating time slot ${timeSlot.id} with booking reference`, error);
          updatedCount++;

          // When all are processed, show confirmation even if some failed
          if (updatedCount === timeSlots.length) {
            alert(`Booking created but some time slots may not be properly linked.`);
          }
        },
      });
    });
  }
}
