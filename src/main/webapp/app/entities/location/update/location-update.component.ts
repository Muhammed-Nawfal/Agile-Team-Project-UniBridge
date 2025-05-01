import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AvailabilityStatus } from 'app/entities/enumerations/availability-status.model';
import { ILocation } from '../location.model';
import { LocationService } from '../service/location.service';
import { LocationFormGroup, LocationFormService } from './location-form.service';

@Component({
  standalone: true,
  selector: 'jhi-location-update',
  templateUrl: './location-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LocationUpdateComponent implements OnInit {
  isSaving = false;
  location: ILocation | null = null;
  availabilityStatusValues = Object.keys(AvailabilityStatus);

  protected locationService = inject(LocationService);
  protected locationFormService = inject(LocationFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LocationFormGroup = this.locationFormService.createLocationFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ location }) => {
      this.location = location;
      if (location) {
        this.updateForm(location);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const location = this.locationFormService.getLocation(this.editForm);
    if (location.id !== null) {
      this.subscribeToSaveResponse(this.locationService.update(location));
    } else {
      this.subscribeToSaveResponse(this.locationService.create(location));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILocation>>): void {
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

  protected updateForm(location: ILocation): void {
    this.location = location;
    this.locationFormService.resetForm(this.editForm, location);
  }
}
