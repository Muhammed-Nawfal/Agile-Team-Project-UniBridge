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
          name: event.name,
          value: event.value,
          min: event.minSize,
          max: event.maxSize,
          startTime: event.startTime,
          endTime: event.endTime,
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
        const normalizedEventValue = eventValue.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const normalizedValue = e.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        return normalizedValue === normalizedEventValue;
      });

      if (foundEvent?.id) {
        console.log('Found normalized match for event:', eventValue, 'with value:', foundEvent.value, 'and ID:', foundEvent.id);
        return foundEvent.id as number;
      }
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

    // Show a sample time slot to inspect its structure
    const sampleSlot = this.availableTimeSlots[0];
    console.log('Sample time slot structure:', JSON.stringify(sampleSlot, null, 2));

    // Format the selected date to match database format
    const formattedSelectedDate = dayjs(this.selectedDate).format('YYYY-MM-DD');

    // Check for time slots that match the hours and the correct date
    const todaySlots = this.availableTimeSlots.filter(slot => String(slot.date) === formattedSelectedDate);

    console.log(`Found ${todaySlots.length} slots for today's date`);

    // Get time slots that match the hours
    const hoursMatchingSlots = this.availableTimeSlots.filter(slot => slot.startHour === startHour && slot.endHour === endHour);

    console.log(`Found ${hoursMatchingSlots.length} slots with matching hours`);
    if (hoursMatchingSlots.length > 0) {
      console.log('First matching slot by hours:', hoursMatchingSlots[0]);
    }

    // First try to find a slot that matches by date, hours AND event ID
    let matchingSlot: ITimeSlot | undefined;

    if (selectedEventId) {
      // Try to find slots matching by hours and event ID
      matchingSlot = this.availableTimeSlots.find(
        slot =>
          String(slot.date) === formattedSelectedDate &&
          slot.startHour === startHour &&
          slot.endHour === endHour &&
          slot.event?.id === selectedEventId,
      );

      if (matchingSlot) {
        console.log('Found perfect match by date, hours and event ID!', matchingSlot);
      } else {
        console.log('No match found with event ID, trying with just date and hours...');
      }
    } else {
      console.log('Could not determine event ID from selection:', this.selectedEvent);
    }

    // If not found by event ID, try with just date and hours
    if (!matchingSlot) {
      matchingSlot = this.availableTimeSlots.find(
        slot => String(slot.date) === formattedSelectedDate && slot.startHour === startHour && slot.endHour === endHour,
      );

      if (matchingSlot) {
        console.log('Found match by date and hours, event ID:', matchingSlot.event?.id);
      }
    }

    // If still not found but we have an event ID, try finding any slot with matching event ID and date
    if (!matchingSlot && selectedEventId) {
      matchingSlot = this.availableTimeSlots.find(
        slot => String(slot.date) === formattedSelectedDate && slot.event?.id === selectedEventId,
      );

      if (matchingSlot) {
        console.log('Found match by date and event ID (ignoring hours):', matchingSlot);
      }
    }

    // Final logging about what we found
    if (!matchingSlot) {
      console.error('No matching time slot found for', {
        slotString,
        startHour,
        endHour,
        selectedEvent: this.selectedEvent,
        selectedEventId,
        date: this.selectedDate,
        formattedDate: formattedSelectedDate,
        availableSlotsCount: this.availableTimeSlots.length,
        todaySlotsCount: todaySlots.length,
      });
    } else {
      console.log('Found matching time slot:', matchingSlot);
    }

    return matchingSlot ?? null;
  }

  // Helper to normalize event names for comparison
  normalizeEventName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^\w]/g, ''); // Remove non-word chars
  }

  createBookingObject(): NewBooking {
    // Get the first selected time slot from the array
    const firstSelectedSlot = this.selectedTimeSlots.length > 0 ? this.selectedTimeSlots[0] : null;

    // Find corresponding time slot entity
    let timeSlotEntity = firstSelectedSlot ? this.findTimeSlotEntity(firstSelectedSlot) : null;

    // FALLBACK: If no time slot entity found but we have available time slots, use the first one
    if (!timeSlotEntity && this.availableTimeSlots.length > 0) {
      console.warn('No exact matching time slot found. Using first available time slot as fallback.');
      // Since time slots are generated hourly, finding a time slot that closely matches our needs is better than failing
      const parsedSlot = this.parseTimeSlot(firstSelectedSlot!);

      // Try to find a slot with similar hours
      for (const slot of this.availableTimeSlots) {
        // If we find a slot with the same start hour, use it
        if (slot.startHour === parsedSlot.start) {
          timeSlotEntity = slot;
          console.log('Using fallback time slot with matching start hour:', slot);
          break;
        }
      }

      // If still no match, just use the first one
      if (!timeSlotEntity) {
        timeSlotEntity = this.availableTimeSlots[0];
        console.log('Using first available time slot as last resort:', timeSlotEntity);
      }
    }

    if (timeSlotEntity) {
      console.log('Selected time slot details:', {
        id: timeSlotEntity.id,
        date: timeSlotEntity.date,
        startHour: timeSlotEntity.startHour,
        endHour: timeSlotEntity.endHour,
        event: timeSlotEntity.event,
        requestedEvent: this.selectedEvent,
        requestedEventId: this.findEventIdByValue(this.selectedEvent),
      });
    }

    // Create a booking object with the mandatory fields
    const booking: NewBooking = {
      id: null,
      activityType: this.selectedActivity as keyof typeof ActivityType,
      eventType: this.selectedEvent.toUpperCase() as keyof typeof EventType,
      bookingDate: dayjs(this.selectedDate),
      partySize: this.selectedPartySize ?? 1,
      bookingStatus: 'CONFIRMED' as keyof typeof BookingStatus,
      // Set createdAt to current time
      createdAt: dayjs(),
      // Set the time slot
      timeSlots: timeSlotEntity,
      // The following fields may be required by the backend validation:
      assignedAt: null,
      bookedActivity: null,
      bookingLocation: null,
      creator: null,
      activity: null,
      timeSlot: null,
    };

    console.log('Created booking with time slot:', timeSlotEntity);
    console.log('Using event type:', this.selectedEvent);
    return booking;
  }

  testBooking(): void {
    const minimalBooking = {
      id: null,
      activityType: 'SPORTS',
      eventType: 'TENNIS_COURT', // Correct format matching backend enum
      bookingDate: dayjs(this.selectedDate),
      partySize: 4,
      bookingStatus: 'CONFIRMED',
    };

    console.log('Testing with minimal booking:', minimalBooking);

    this.bookingService.create(minimalBooking as any).subscribe({
      next(response) {
        console.log('Test booking successful!', response);
      },
      error(error) {
        console.error('Test booking failed', error);
      },
    });
  }

  onSubmit(): void {
    if (!this.validateBookingData()) {
      return;
    }

    const bookingData = this.createBookingObject();

    // Check if a valid time slot was found
    if (!bookingData.timeSlots) {
      this.bookingError = 'Could not find a valid time slot in the database. Please try again or contact support.';
      console.error('No matching time slot found for:', this.selectedTimeSlots);
      return;
    }

    console.log('Sending booking data:', bookingData); // Log what you're sending

    this.bookingService.create(bookingData).subscribe({
      next: response => {
        console.log('Booking submitted successfully!', response);
        this.bookingError = null;
        alert('Booking submitted successfully! Check console for details. Click OK to continue.');
        // Don't refresh the page so console logs remain visible
        // window.location.reload();
      },
      error: error => {
        console.error('Error creating booking', error);
        // More detailed error message
        if (error.error?.detail) {
          this.bookingError = `Failed to create booking: ${error.error.detail}`;
        } else if (error.error?.message) {
          this.bookingError = `Failed to create booking: ${error.error.message}`;
        } else {
          this.bookingError = 'Failed to create booking. Please try again.';
        }
      },
    });
  }
}
