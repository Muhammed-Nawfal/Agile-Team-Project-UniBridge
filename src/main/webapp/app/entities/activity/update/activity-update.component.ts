import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IChallenge } from 'app/entities/challenge/challenge.model';
import { ChallengeService } from 'app/entities/challenge/service/challenge.service';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { Status } from 'app/entities/enumerations/status.model';
import { ActivityService } from '../service/activity.service';
import { IActivity } from '../activity.model';
import { ActivityFormGroup, ActivityFormService } from './activity-form.service';

@Component({
  standalone: true,
  selector: 'jhi-activity-update',
  templateUrl: './activity-update.component.html',
  styleUrl: 'activity-update.component.scss',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ActivityUpdateComponent implements OnInit {
  isSaving = false;
  activity: IActivity | null = null;
  activityTypeValues = Object.keys(ActivityType);
  statusValues = Object.keys(Status);

  profilesSharedCollection: IProfile[] = [];
  challengesSharedCollection: IChallenge[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected activityService = inject(ActivityService);
  protected activityFormService = inject(ActivityFormService);
  protected profileService = inject(ProfileService);
  protected challengeService = inject(ChallengeService);
  protected elementRef = inject(ElementRef);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ActivityFormGroup = this.activityFormService.createActivityFormGroup();

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  compareChallenge = (o1: IChallenge | null, o2: IChallenge | null): boolean => this.challengeService.compareChallenge(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ activity }) => {
      this.activity = activity;
      if (activity) {
        this.updateForm(activity);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('teamproject24App.error', { message: err.message })),
    });
  }

  clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    if (idInput && this.elementRef.nativeElement.querySelector(`#${idInput}`)) {
      this.elementRef.nativeElement.querySelector(`#${idInput}`).value = null;
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const activity = this.activityFormService.getActivity(this.editForm);
    if (activity.id !== null) {
      this.subscribeToSaveResponse(this.activityService.update(activity));
    } else {
      this.subscribeToSaveResponse(this.activityService.create(activity));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IActivity>>): void {
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

  protected updateForm(activity: IActivity): void {
    this.activity = activity;
    this.activityFormService.resetForm(this.editForm, activity);

    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      activity.creator,
    );
    this.challengesSharedCollection = this.challengeService.addChallengeToCollectionIfMissing<IChallenge>(
      this.challengesSharedCollection,
      activity.challenge,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(map((profiles: IProfile[]) => this.profileService.addProfileToCollectionIfMissing<IProfile>(profiles, this.activity?.creator)))
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));

    this.challengeService
      .query()
      .pipe(map((res: HttpResponse<IChallenge[]>) => res.body ?? []))
      .pipe(
        map((challenges: IChallenge[]) =>
          this.challengeService.addChallengeToCollectionIfMissing<IChallenge>(challenges, this.activity?.challenge),
        ),
      )
      .subscribe((challenges: IChallenge[]) => (this.challengesSharedCollection = challenges));
  }
}
