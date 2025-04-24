import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IActivity } from 'app/entities/activity/activity.model';
import { ActivityService } from 'app/entities/activity/service/activity.service';
import { ParticipationStatus } from 'app/entities/enumerations/participation-status.model';
import { ActivityParticipantService } from '../service/activity-participant.service';
import { IActivityParticipant } from '../activity-participant.model';
import { ActivityParticipantFormGroup, ActivityParticipantFormService } from './activity-participant-form.service';

@Component({
  standalone: true,
  selector: 'jhi-activity-participant-update',
  templateUrl: './activity-participant-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ActivityParticipantUpdateComponent implements OnInit {
  isSaving = false;
  activityParticipant: IActivityParticipant | null = null;
  participationStatusValues = Object.keys(ParticipationStatus);

  profilesSharedCollection: IProfile[] = [];
  activitiesSharedCollection: IActivity[] = [];

  protected activityParticipantService = inject(ActivityParticipantService);
  protected activityParticipantFormService = inject(ActivityParticipantFormService);
  protected profileService = inject(ProfileService);
  protected activityService = inject(ActivityService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ActivityParticipantFormGroup = this.activityParticipantFormService.createActivityParticipantFormGroup();

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  compareActivity = (o1: IActivity | null, o2: IActivity | null): boolean => this.activityService.compareActivity(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ activityParticipant }) => {
      this.activityParticipant = activityParticipant;
      if (activityParticipant) {
        this.updateForm(activityParticipant);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const activityParticipant = this.activityParticipantFormService.getActivityParticipant(this.editForm);
    if (activityParticipant.id !== null) {
      this.subscribeToSaveResponse(this.activityParticipantService.update(activityParticipant));
    } else {
      this.subscribeToSaveResponse(this.activityParticipantService.create(activityParticipant));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IActivityParticipant>>): void {
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

  protected updateForm(activityParticipant: IActivityParticipant): void {
    this.activityParticipant = activityParticipant;
    this.activityParticipantFormService.resetForm(this.editForm, activityParticipant);

    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      activityParticipant.participant,
    );
    this.activitiesSharedCollection = this.activityService.addActivityToCollectionIfMissing<IActivity>(
      this.activitiesSharedCollection,
      activityParticipant.activity,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(
        map((profiles: IProfile[]) =>
          this.profileService.addProfileToCollectionIfMissing<IProfile>(profiles, this.activityParticipant?.participant),
        ),
      )
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));

    this.activityService
      .query()
      .pipe(map((res: HttpResponse<IActivity[]>) => res.body ?? []))
      .pipe(
        map((activities: IActivity[]) =>
          this.activityService.addActivityToCollectionIfMissing<IActivity>(activities, this.activityParticipant?.activity),
        ),
      )
      .subscribe((activities: IActivity[]) => (this.activitiesSharedCollection = activities));
  }
}
