import { Component, NgZone, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IBooking } from '../booking.model';
import { BookingService, EntityArrayResponseType } from '../service/booking.service';
import { BookingDeleteDialogComponent } from '../delete/booking-delete-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'jhi-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  imports: [RouterModule, FormsModule, SharedModule, CommonModule],
})
export class BookingComponent {
  events = [
    { name: 'Football Pitch', value: 'Football_Pitch', min: 1, max: 22 },
    { name: 'Tennis Court', value: 'Tennis_Court', min: 2, max: 4 },
    { name: 'Basketball Court', value: 'Basketball_Court', min: 1, max: 10 },
    { name: 'Study Spaces', value: 'Study_Spaces', min: 2, max: 8 },
    { name: 'Event Rooms', value: 'Event_Rooms', min: 2, max: 15 },
    { name: 'DOJO', value: 'DOJO', min: 1, max: 20 },
    { name: 'Swimming Pool', value: 'Swimming_Pool', min: 1, max: 20 },
    { name: 'Squash Court', value: 'Squash_Court', min: 2, max: 4 },
  ];

  partySizes: number[] = [];

  onEventChange(event: any): void {
    const currentSelectedEvent = event.target.value;
    const findSelectedEvent = this.events.find(e => e.value === currentSelectedEvent);

    if (findSelectedEvent) {
      this.partySizes = [];
      for (let size = findSelectedEvent.min; size <= findSelectedEvent.max; size++) {
        this.partySizes.push(size);
      }
    } else {
      this.partySizes = [];
    }
  }
}
