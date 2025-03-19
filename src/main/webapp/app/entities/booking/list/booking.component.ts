import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'jhi-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [RouterModule, FormsModule, CommonModule],
})
export class BookingComponent {
  activities = [
    {
      name: 'Social',
      value: 'Social',
      events: [
        { name: 'Study Spaces', value: 'Study_Spaces', min: 2, max: 8, startTime: 9, endTime: 22 },
        { name: 'Event Rooms', value: 'Event_Rooms', min: 10, max: 20, startTime: 9, endTime: 22 },
      ],
    },
    {
      name: 'Sports',
      value: 'Sports',
      events: [
        { name: 'Football Pitch', value: 'Football_Pitch', min: 1, max: 22, startTime: 8, endTime: 24 },
        { name: 'Tennis Court', value: 'Tennis_Court', min: 2, max: 4, startTime: 8, endTime: 22 },
        { name: 'Basketball Court', value: 'Basketball_Court', min: 1, max: 10, startTime: 8, endTime: 24 },
        { name: 'DOJO', value: 'DOJO', min: 1, max: 20, startTime: 8, endTime: 22 },
        { name: 'Swimming Pool', value: 'Swimming_Pool', min: 1, max: 20, startTime: 8, endTime: 24 },
        { name: 'Squash Court', value: 'Squash_Court', min: 2, max: 4, startTime: 8, endTime: 24 },
      ],
    },
    { name: 'Academic', value: 'Academic', events: [] },
    { name: 'Gym', value: 'Gym', events: [] },
    { name: 'Other', value: 'Other', events: [] },
  ];

  events: any[] = [];
  partySizes: number[] = [];
  timeSlots: string[] = [];
  selectedTimeSlots: string[] = [];
  showConfirmation = false;

  // Hardcoded upcoming activities
  upcomingActivities = [
    { name: 'Basketball', icon: '🏀', time: '18:00 - 19:00' },
    { name: 'Swimming', icon: '🏊‍♂️', time: '17:00 - 18:00' },
    { name: 'Tennis', icon: '🎾', time: '16:00 - 17:00' },
  ];

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
      const foundEvent = activity.events.find(e => e.value === eventValue);
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

  onTimeSlotChange(event: any): void {
    const value = event.target.value;
    const checked = event.target.checked;

    if (checked) {
      if (!this.selectedTimeSlots.includes(value)) {
        this.selectedTimeSlots.push(value);
      }
    } else {
      this.selectedTimeSlots = this.selectedTimeSlots.filter(slot => slot !== value);
    }
  }

  onSubmit(): void {
    alert('Booking submitted!');
    window.location.reload();
  }
}
