import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IEvent } from 'app/entities/event/event.model';
import { EventService } from 'app/entities/event/service/event.service';
import { AvailabilityStatus } from 'app/entities/enumerations/availability-status.model';
import { TimeSlotService } from '../service/time-slot.service';
import { ITimeSlot } from '../time-slot.model';
import { TimeSlotFormGroup, TimeSlotFormService } from './time-slot-form.service';

@Component({
  standalone: true,
  selector: 'jhi-time-slot-update',
  templateUrl: './time-slot-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TimeSlotUpdateComponent implements OnInit {
  isSaving = false;
  timeSlot: ITimeSlot | null = null;
  availabilityStatusValues = Object.keys(AvailabilityStatus);

  eventsSharedCollection: IEvent[] = [];

  protected timeSlotService = inject(TimeSlotService);
  protected timeSlotFormService = inject(TimeSlotFormService);
  protected eventService = inject(EventService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TimeSlotFormGroup = this.timeSlotFormService.createTimeSlotFormGroup();

  compareEvent = (o1: IEvent | null, o2: IEvent | null): boolean => this.eventService.compareEvent(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ timeSlot }) => {
      this.timeSlot = timeSlot;
      if (timeSlot) {
        this.updateForm(timeSlot);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const timeSlot = this.timeSlotFormService.getTimeSlot(this.editForm);
    if (timeSlot.id !== null) {
      this.subscribeToSaveResponse(this.timeSlotService.update(timeSlot));
    } else {
      this.subscribeToSaveResponse(this.timeSlotService.create(timeSlot));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITimeSlot>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(timeSlot: ITimeSlot): void {
    this.timeSlot = timeSlot;
    this.timeSlotFormService.resetForm(this.editForm, timeSlot);

    this.eventsSharedCollection = this.eventService.addEventToCollectionIfMissing<IEvent>(this.eventsSharedCollection, timeSlot.event);
  }

  protected loadRelationshipsOptions(): void {
    this.eventService
      .query()
      .pipe(map((res: HttpResponse<IEvent[]>) => res.body ?? []))
      .pipe(map((events: IEvent[]) => this.eventService.addEventToCollectionIfMissing<IEvent>(events, this.timeSlot?.event)))
      .subscribe((events: IEvent[]) => (this.eventsSharedCollection = events));
  }
}
