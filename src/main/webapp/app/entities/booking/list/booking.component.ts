/* eslint-disable no-console */

import { Component, OnInit } from '@angular/core';
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
    let selectedEvent = null;

    for (const activity of this.activities) {
      const foundEvent = activity.events.find((e: { value: string }) => e.value === this.selectedEvent);
      if (foundEvent) {
        selectedEvent = foundEvent;
        break;
      }
    }

    if (selectedEvent) {
      this.partySizes = [];
      for (let i = selectedEvent.min; i <= selectedEvent.max; i++) {
        this.partySizes.push(i);
      }

      this.generateTimeSlots(selectedEvent.startTime, selectedEvent.endTime);
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

  createBookingObject(): NewBooking {
    // Create a booking object with the mandatory fields
    const booking: NewBooking = {
      id: null,
      activityType: this.selectedActivity as keyof typeof ActivityType,
      eventType: this.selectedEvent.toUpperCase().replace(' ', '_') as keyof typeof EventType,
      bookingDate: dayjs(this.selectedDate),
      partySize: this.selectedPartySize ?? 1,
      bookingStatus: 'CONFIRMED' as keyof typeof BookingStatus,
      // Set createdAt to current time
      createdAt: dayjs(),
      // The following fields may be required by the backend validation:
      assignedAt: null,
      timeSlots: null,
      bookedActivity: null,
      bookingLocation: null,
      creator: null,
      activity: null,
      timeSlot: null,
    };

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

    console.log('Sending booking data:', bookingData); // Log what you're sending

    this.bookingService.create(bookingData).subscribe({
      next(response) {
        console.log('Booking submitted successfully!', response);
        alert('Booking submitted successfully!');
        window.location.reload();
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
