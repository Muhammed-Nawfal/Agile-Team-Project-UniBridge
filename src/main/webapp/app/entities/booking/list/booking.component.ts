import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observer } from 'rxjs';
import { EventService } from 'app/entities/event/service/event.service';
import { IEvent } from 'app/entities/event/event.model';

// Define ActivityType enum directly in the component
enum ActivityType {
  SOCIAL = 'SOCIAL',
  ACADEMIC = 'ACADEMIC',
  SPORTS = 'SPORTS',
  GYM = 'GYM',
  OTHER = 'OTHER',
}

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    // Fix: Using the Observer pattern instead of separate callbacks
    this.http.get<IEvent[]>('api/events').subscribe({
      next: events => {
        // Group events by activity type
        const activityGroups = this.groupEventsByActivityType(events);
        this.activities = activityGroups;
      },
      error: error => {
        console.error('Error loading events', error);
        // Fall back to hardcoded data if API fails
        this.initializeHardcodedActivities();
      }, // Make sure there's a comma here
    });
  }

  initializeHardcodedActivities(): void {
    this.activities = [
      {
        name: 'Social',
        value: 'SOCIAL',
        events: [
          { name: 'Study Spaces', value: 'Study_Spaces', min: 2, max: 8, startTime: 9, endTime: 22 },
          { name: 'Event Rooms', value: 'Event_Rooms', min: 10, max: 20, startTime: 9, endTime: 22 },
        ],
      },
      {
        name: 'Sports',
        value: 'SPORTS',
        events: [
          { name: 'Football Pitch', value: 'Football_Pitch', min: 1, max: 22, startTime: 8, endTime: 24 },
          { name: 'Tennis Court', value: 'Tennis_Court', min: 2, max: 4, startTime: 8, endTime: 22 },
          { name: 'Basketball Court', value: 'Basketball_Court', min: 1, max: 10, startTime: 8, endTime: 24 },
          { name: 'DOJO', value: 'DOJO', min: 1, max: 20, startTime: 8, endTime: 22 },
          { name: 'Swimming Pool', value: 'Swimming_Pool', min: 1, max: 20, startTime: 8, endTime: 24 },
          { name: 'Squash Court', value: 'Squash_Court', min: 2, max: 4, startTime: 8, endTime: 24 },
        ],
      },
      { name: 'Academic', value: 'ACADEMIC', events: [] },
      { name: 'Gym', value: 'GYM', events: [] },
      { name: 'Other', value: 'OTHER', events: [] },
    ];
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

    // Convert map to array
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
    const activityValue = event.target.value;
    const selectedActivity = this.activities.find(act => act.value === activityValue);

    this.events = selectedActivity ? selectedActivity.events : [];
    this.partySizes = [];
    this.timeSlots = [];
    this.selectedTimeSlots = [];
  }

  onEventChange(event: any): void {
    const eventValue = event.target.value;
    let selectedEvent = null;

    for (const activity of this.activities) {
      const foundEvent = activity.events.find((e: { value: string }) => e.value === eventValue);
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
    return this.selectedTimeSlots.length >= this.MAX_SLOTS && !this.selectedTimeSlots.includes(slot);
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
        this.selectedTimeSlots.sort();
      }
    } else {
      this.selectedTimeSlots = this.selectedTimeSlots.filter(slot => slot !== value);
    }
    this.bookingError = null;
  }

  // Helper function to parse time slot strings like "09:00 - 10:00"
  parseTimeSlot(timeSlot: string): { start: number; end: number } {
    const [startStr, endStr] = timeSlot.split(' - ');
    const startHour = parseInt(startStr.split(':')[0], 10);
    const endHour = parseInt(endStr.split(':')[0], 10) || 24; // Handle midnight "00:00" as 24

    return { start: startHour, end: endHour };
  }

  onSubmit(): void {
    alert('Booking submitted!');
    window.location.reload();
  }
}
