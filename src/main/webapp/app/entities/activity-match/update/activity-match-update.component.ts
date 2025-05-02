import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IRanking } from 'app/entities/ranking/ranking.model';
import { RankingService } from 'app/entities/ranking/service/ranking.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IActivity } from 'app/entities/activity/activity.model';
import { ActivityService } from 'app/entities/activity/service/activity.service';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { Decision } from 'app/entities/enumerations/decision.model';
import { ActivityMatchService } from '../service/activity-match.service';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchFormGroup, ActivityMatchFormService } from './activity-match-form.service';

@Component({
  standalone: true,
  selector: 'jhi-activity-match-update',
  templateUrl: './activity-match-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ActivityMatchUpdateComponent implements OnInit {
  isSaving = false;
  activityMatch: IActivityMatch | null = null;
  activityTypeValues = Object.keys(ActivityType);
  decisionValues = Object.keys(Decision);

  ratingsCollection: IRanking[] = [];
  profilesSharedCollection: IProfile[] = [];
  activitiesSharedCollection: IActivity[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected activityMatchService = inject(ActivityMatchService);
  protected activityMatchFormService = inject(ActivityMatchFormService);
  protected rankingService = inject(RankingService);
  protected profileService = inject(ProfileService);
  protected activityService = inject(ActivityService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ActivityMatchFormGroup = this.activityMatchFormService.createActivityMatchFormGroup();

  compareRanking = (o1: IRanking | null, o2: IRanking | null): boolean => this.rankingService.compareRanking(o1, o2);

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  compareActivity = (o1: IActivity | null, o2: IActivity | null): boolean => this.activityService.compareActivity(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ activityMatch }) => {
      this.activityMatch = activityMatch;
      if (activityMatch) {
        this.updateForm(activityMatch);
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

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const activityMatch = this.activityMatchFormService.getActivityMatch(this.editForm);
    if (activityMatch.id !== null) {
      this.subscribeToSaveResponse(this.activityMatchService.update(activityMatch));
    } else {
      this.subscribeToSaveResponse(this.activityMatchService.create(activityMatch));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IActivityMatch>>): void {
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

  protected updateForm(activityMatch: IActivityMatch): void {
    this.activityMatch = activityMatch;
    this.activityMatchFormService.resetForm(this.editForm, activityMatch);

    this.ratingsCollection = this.rankingService.addRankingToCollectionIfMissing<IRanking>(this.ratingsCollection, activityMatch.ratings);
    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      activityMatch.matchRequestor,
      activityMatch.userDetails,
    );
    this.activitiesSharedCollection = this.activityService.addActivityToCollectionIfMissing<IActivity>(
      this.activitiesSharedCollection,
      activityMatch.matchedActivity,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.rankingService
      .query({ filter: 'activitymatch-is-null' })
      .pipe(map((res: HttpResponse<IRanking[]>) => res.body ?? []))
      .pipe(
        map((rankings: IRanking[]) => this.rankingService.addRankingToCollectionIfMissing<IRanking>(rankings, this.activityMatch?.ratings)),
      )
      .subscribe((rankings: IRanking[]) => (this.ratingsCollection = rankings));

    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(
        map((profiles: IProfile[]) =>
          this.profileService.addProfileToCollectionIfMissing<IProfile>(
            profiles,
            this.activityMatch?.matchRequestor,
            this.activityMatch?.userDetails,
          ),
        ),
      )
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));

    this.activityService
      .query()
      .pipe(map((res: HttpResponse<IActivity[]>) => res.body ?? []))
      .pipe(
        map((activities: IActivity[]) =>
          this.activityService.addActivityToCollectionIfMissing<IActivity>(activities, this.activityMatch?.matchedActivity),
        ),
      )
      .subscribe((activities: IActivity[]) => (this.activitiesSharedCollection = activities));
  }
}
