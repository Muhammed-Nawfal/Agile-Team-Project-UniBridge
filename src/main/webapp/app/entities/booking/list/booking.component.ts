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
import { firstValueFrom } from 'rxjs';
import { ActivityService } from 'app/entities/activity/service/activity.service';
import { IActivity } from 'app/entities/activity/activity.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IProfile } from 'app/entities/profile/profile.model';

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
  updateTimeSlots: string[] = [];
  selectedTimeSlots: string[] = [];
  showConfirmation = false;
  selectedDate = '';
  selectedActivity = '';
  selectedEvent = '';
  selectedPartySize: number | null = null;
  availableTimeSlots: ITimeSlot[] = [];
  fullyBookedTimeSlots: string[] = [];
  loadedActivities: IActivity[] = [];
  selectedSocialActivity = '';
  currentUserProfile: IProfile | null = null;
  bookings: any[] = [];
  isLoading = false;
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
      selectSActivity: 'PICK A SOCIAL ACTIVITY',
      selectTime: 'TIME',
      bookNow: 'BOOK',
      upcomingActivities: 'UPCOMING',
      time: 'Time',
      defaultActivity: 'Activities',
      defaultEvent: 'Events',
      defaultPartySize: 'Party Sizes',
      noBookings: 'NO BOOKINGS, MAKE ONE NOW',
      date: 'Date',
      location: 'Location',
      status: 'Status',
      partySize: 'Party Size',
      delete: 'DELETE',
      confirmDelete: 'Confirm Delete',
      deleteConfirmationMessage: 'Are you sure you want to delete this booking?',
      cancel: 'CANCEL',
      update: 'UPDATE',
      save: 'SAVE',
      event: 'Event',
      activity: 'Activity',
      socialActivities: 'Social Activities',
      none: 'None',
      selected: 'Selected',
    },
    es: {
      booking: 'RESERVA',
      selectDate: 'ELEGIR UNA FECHA',
      selectActivity: 'SELECCIONAR UNA ACTIVIDAD',
      selectEvent: 'SELECCIONAR UN EVENTO',
      selectPartySize: 'TAMAÑO DEL GRUPO',
      selectTime: 'TIEMPO',
      bookNow: 'RESERVAR',
      upcomingActivities: 'PRÓXIMAS',
      time: 'Hora',
      defaultActivity: 'Actividades',
      defaultEvent: 'Eventos',
      defaultPartySize: 'Tamaño del Grupo',
      noBookings: 'NO HAY RESERVAS, HAGA UNA AHORA',
      date: 'Fecha',
      location: 'Ubicación',
      status: 'Estado',
      partySize: 'Tamaño del Grupo',
      delete: 'ELIMINAR',
      confirmDelete: 'Confirmar Eliminación',
      deleteConfirmationMessage: '¿Estás seguro de que quieres eliminar esta reserva?',
      cancel: 'CANCELAR',
      update: 'ACTUALIZAR',
      save: 'GUARDAR',
      event: 'Evento',
      activity: 'Actividad',
      socialActivities: 'Actividades Sociales',
      none: 'Ninguna',
      selected: 'Seleccionada',
    },
  };

  selectedBooking: any = null;
  showModal = false;
  showDeleteConfirmation = false;
  isEditMode = false;
  updatedDate = '';
  updatedPartySize: number | null = null;
  updatedTimeSlots: string[] = [];
  bookedActivityIds = new Set<number>();
  selectedActivityIds = new Set<number>();

  private _tempAllActivities: IActivity[] = []; // Property to store activities temporarily

  constructor(
    private http: HttpClient,
    private bookingService: BookingService,
    private accountService: AccountService,
    private eventService: EventService,
    public timeSlotService: TimeSlotService,
    private activityService: ActivityService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    // First load the user profile
    this.loadCurrentUserProfile();
    // Activities will be loaded after profile is ready
  }

  loadUserBookingsList(): void {
    this.isLoadingBookings = true;

    if (!this.currentUserProfile) {
      console.error('No current user profile found');
      this.isLoadingBookings = false;
      return;
    }

    this.bookingService.loadUserBookings(this.currentUserProfile.id).subscribe({
      next: (bookings: any[]) => {
        this.upcomingBookings = bookings;
        this.isLoadingBookings = false;
        console.log('Loaded user bookings:', this.upcomingBookings);
      },
      error: error => {
        console.error('Error loading bookings', error);
        this.isLoadingBookings = false;
      },
    });
  }

  loadCurrentUserProfile(): void {
    console.log('Starting to load current user profile...');

    this.accountService.identity().subscribe({
      next: account => {
        if (!account?.login) {
          console.error('No account login found');
          return;
        }

        console.log('Looking up profile for login:', account.login);
        this.profileService.query({ 'login.equals': account.login, size: 1 }).subscribe({
          next: response => {
            console.log('Profile response:', response);
            if (response.body && response.body.length > 0) {
              const profile = response.body.find(p => p.login === account.login);
              if (profile) {
                this.currentUserProfile = profile;
                console.log('Successfully loaded profile:', this.currentUserProfile);

                // Load activities after profile is loaded
                this.loadActivities();

                // Load bookings after profile is loaded
                this.loadUserBookingsList();
              } else {
                console.error('No matching profile found for login:', account.login);
              }
            } else {
              console.error('No profile found for login:', account.login);
            }
          },
          error(error) {
            console.error('Error loading profile:', error);
          },
        });
      },
      error(error) {
        console.error('Error loading account:', error);
      },
    });
  }

  loadActivities(): void {
    if (!this.currentUserProfile?.id) {
      console.error('No current user profile available');
      return;
    }

    this.activityService.query().subscribe({
      next: response => {
        const allActivities = response.body ?? [];
        // Safely filter activities to avoid null reference error
        this.loadedActivities = allActivities.filter(activity => activity.creator && activity.creator.id === this.currentUserProfile!.id);
        console.log('Filtered activities:', this.loadedActivities);
      },
      error(err) {
        console.error('Error loading activities:', err);
      },
    });
  }

  loadEvents(): void {
    this.http.get<IEvent[]>('api/events').subscribe({
      next: events => {
        console.log('Loaded Events:', events);
        const activityGroups = this.groupEventsByActivityType(events);
        this.activities = activityGroups;
        console.log('Grouped Activities:', this.activities);
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

    // Handle regular event-based activities
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
    const error = this.bookingService.validateBookingData({
      selectedDate: this.selectedDate,
      selectedActivity: this.selectedActivity,
      selectedEvent: this.selectedEvent,
      selectedPartySize: this.selectedPartySize,
      selectedTimeSlots: this.selectedTimeSlots,
    });

    if (error) {
      this.bookingError = error;
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
    const eventId = this.eventService.findEventIdByValue(this.selectedEvent, this.activities) ?? null;

    this.timeSlotService
      .fetchAvailableTimeSlotsForEvent(
        formattedDate,
        eventId,
        this.timeSlots,
        this.selectedEvent,
        this.activities,
        this.eventService,
        this.bookingService,
      )
      .subscribe({
        next: result => {
          this.availableTimeSlots = result.available;
          this.fullyBookedTimeSlots = result.fullyBooked;
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

    if (!this.currentUserProfile) {
      console.error('No current user profile found');
      this.bookingError = 'Unable to create booking: User profile not found';
      return;
    }

    this.bookingService
      .createBookingWithTimeSlots(
        {
          selectedDate: this.selectedDate,
          selectedActivity: this.selectedActivity,
          selectedEvent: this.selectedEvent,
          selectedPartySize: this.selectedPartySize,
          selectedTimeSlots: this.selectedTimeSlots,
          selectedSocialActivity: this.selectedSocialActivity,
          currentUserProfile: this.currentUserProfile,
          activities: this.activities,
          loadedActivities: this.loadedActivities,
        },
        this.timeSlotService,
      )
      .subscribe({
        next: result => {
          if (result.success) {
            this.bookingError = null;
            window.location.reload();
          } else {
            this.bookingError = result.error ?? 'Failed to create booking';
          }
        },
        error: error => {
          console.error('Error creating booking:', error);
          this.bookingError = 'Failed to create booking. Please try again.';
        },
      });
  }

  openBookingDetails(booking: any): void {
    this.updatedDate = '';
    this.updatedPartySize = null;
    this.updatedTimeSlots = [];
    this.partySizes = [];
    this.updateTimeSlots = [];
    this.availableTimeSlots = [];
    this.fullyBookedTimeSlots = [];
    this.isEditMode = false;

    console.log('Initial booking data:', booking);

    // Always load full booking details
    this.bookingService.find(booking.id).subscribe({
      next: response => {
        console.log('Full booking response:', response.body);
        if (response.body) {
          // If there's a bookedActivity, load its full details
          if (response.body.bookedActivity?.id) {
            this.activityService.find(response.body.bookedActivity.id).subscribe({
              next: activityResponse => {
                this.selectedBooking = {
                  ...response.body,
                  name: booking.name,
                  date: booking.date,
                  time: booking.time,
                  locationName: booking.locationName,
                  bookedActivity: activityResponse.body,
                };
                console.log('Final selected booking with activity:', this.selectedBooking);
                this.showModal = true;
              },
              error: error => {
                console.error('Error loading activity details:', error);
                this.selectedBooking = {
                  ...response.body,
                  name: booking.name,
                  date: booking.date,
                  time: booking.time,
                  locationName: booking.locationName,
                };
                this.showModal = true;
              },
            });
          } else {
            this.selectedBooking = {
              ...response.body,
              name: booking.name,
              date: booking.date,
              time: booking.time,
              locationName: booking.locationName,
            };
            console.log('Final selected booking:', this.selectedBooking);
            this.showModal = true;
          }
        }
      },
      error: error => {
        console.error('Error loading booking details:', error);
        this.selectedBooking = booking;
        this.showModal = true;
      },
    });
  }

  closeModal(): void {
    this.selectedBooking = null;
    this.showModal = false;
    this.showDeleteConfirmation = false;
  }

  confirmDelete(): void {
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
  }

  deleteBooking(): void {
    if (!this.selectedBooking) return;

    this.bookingService.deleteBooking(this.selectedBooking.id).subscribe({
      next: () => {
        // Remove the activity from selectedActivityIds if it exists
        if (this.selectedBooking.bookedActivity?.id) {
          this.selectedActivityIds.delete(this.selectedBooking.bookedActivity.id);
        }
        this.loadUserBookingsList();
        this.closeModal();
      },
      error: (error: unknown) => {
        this.bookingError = 'Failed to delete booking. Please try again.';
      },
    });
  }

  updateBooking(): void {
    this.updatedDate = '';
    this.updatedPartySize = null;
    this.updatedTimeSlots = [];
    this.partySizes = [];
    this.updateTimeSlots = [];
    this.availableTimeSlots = [];
    this.fullyBookedTimeSlots = [];

    this.isEditMode = true;
    this.updatedDate = dayjs(this.selectedBooking.date).format('YYYY-MM-DD');
    this.updatedPartySize = this.selectedBooking.partySize;
    this.selectedSocialActivity = this.selectedBooking.bookedActivity ? `activity-${this.selectedBooking.bookedActivity.id}` : '';

    const timeRange = this.selectedBooking.time.split(' - ');
    if (timeRange.length === 2) {
      const startTime = timeRange[0];
      const endTime = timeRange[1];

      let selectedEventObj = null;
      for (const activity of this.activities) {
        if (activity.value === this.selectedBooking.activityType) {
          const foundEvent = activity.events.find((e: { name: string }) => {
            const eventName: string = e.name.toLowerCase();
            const bookingName: string = this.selectedBooking.name.toLowerCase();
            return eventName === bookingName || eventName === `${bookingName}s` || `${eventName}s` === bookingName;
          });
          if (foundEvent) {
            selectedEventObj = foundEvent;
            this.updateTimeSlots = this.timeSlotService.generateTimeSlots(selectedEventObj.startTime, selectedEventObj.endTime);

            const startHour = parseInt(startTime.split(':')[0], 10);
            const endHour = parseInt(endTime.split(':')[0], 10);

            for (let hour = startHour; hour < endHour; hour++) {
              const slotStart = hour.toString().padStart(2, '0') + ':00';
              const slotEnd = (hour + 1).toString().padStart(2, '0') + ':00';
              const slot = `${slotStart} - ${slotEnd}`;
              if (this.updateTimeSlots.includes(slot)) {
                this.updatedTimeSlots.push(slot);
              }
            }

            this.fetchAvailableTimeSlots();
            break;
          }
        }
      }

      if (selectedEventObj) {
        this.partySizes = [];
        for (let i = selectedEventObj.min; i <= selectedEventObj.max; i++) {
          this.partySizes.push(i);
        }
      }
    }
  }

  saveUpdate(): void {
    if (!this.selectedBooking) return;

    const partySize = Number(this.updatedPartySize);
    if (isNaN(partySize)) {
      this.bookingError = 'Invalid party size';
      return;
    }

    let eventType = this.selectedBooking.eventType;
    if (!eventType) {
      for (const activity of this.activities) {
        if (activity.value === this.selectedBooking.activityType) {
          const foundEvent = activity.events.find((e: { name: string }) => {
            const eventName: string = e.name.toLowerCase();
            const bookingName: string = this.selectedBooking.name.toLowerCase();
            return eventName === bookingName || eventName === `${bookingName}s` || `${eventName}s` === bookingName;
          });
          if (foundEvent) {
            eventType = foundEvent.value.toUpperCase();
            break;
          }
        }
      }
    }

    if (!eventType) {
      this.bookingError = 'Could not determine event type';
      return;
    }

    // Find the selected social activity if one is selected
    let bookedActivity: IActivity | null = null;
    if (this.selectedSocialActivity.startsWith('activity-')) {
      const activityId = Number(this.selectedSocialActivity.replace('activity-', ''));
      bookedActivity = this.loadedActivities.find(act => act.id === activityId) ?? null;
    }

    // Update selectedActivityIds
    if (this.selectedBooking.bookedActivity?.id) {
      this.selectedActivityIds.delete(this.selectedBooking.bookedActivity.id);
    }
    if (bookedActivity?.id) {
      this.selectedActivityIds.add(bookedActivity.id);
    }

    const updatedBooking = {
      id: this.selectedBooking.id,
      activityType: this.selectedBooking.activityType,
      eventType: eventType as keyof typeof EventType,
      bookingDate: dayjs(this.selectedBooking.date),
      partySize,
      timeSlot: this.selectedBooking.timeSlot,
      bookingStatus: 'CONFIRMED' as const,
      createdAt: dayjs(),
      bookingLocation: this.selectedBooking.bookingLocation || null,
      creator: this.selectedBooking.creator || null,
      activity: this.selectedBooking.activity || null,
      bookedActivity,
      assignedAt: this.selectedBooking.assignedAt || null,
    };

    this.bookingService.update(updatedBooking).subscribe({
      next: () => {
        this.loadUserBookingsList();
        this.isEditMode = false;
        this.closeModal();
      },
      error: (error: unknown) => {
        this.bookingError = 'Failed to update booking. Please try again.';
      },
    });
  }

  cancelUpdate(): void {
    this.isEditMode = false;
    this.updatedDate = '';
    this.updatedPartySize = null;
    this.updatedTimeSlots = [];
  }

  onSocialActivityChange(event: any): void {
    const value = event.target.value;
    if (value.startsWith('activity-')) {
      const activityId = Number(value.replace('activity-', ''));
      if (this.selectedActivityIds.has(activityId)) {
        this.selectedActivityIds.delete(activityId);
      } else {
        this.selectedActivityIds.add(activityId);
      }
    }
    this.selectedSocialActivity = value;
  }

  isActivitySelected(activity: IActivity): boolean {
    return this.selectedActivityIds.has(activity.id) || this.bookedActivityIds.has(activity.id);
  }

  isActivitySelectable(activity: IActivity, isUpdate = false): boolean {
    if (isUpdate && this.selectedBooking?.bookedActivity?.id === activity.id) {
      return true; // Allow selecting the booking's own activity
    }
    return !this.isActivitySelected(activity);
  }
}
