import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
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

  profilesSharedCollection: IProfile[] = [];
  usersSharedCollection: IUser[] = [];
  activitiesSharedCollection: IActivity[] = [];

  protected activityMatchService = inject(ActivityMatchService);
  protected activityMatchFormService = inject(ActivityMatchFormService);
  protected profileService = inject(ProfileService);
  protected userService = inject(UserService);
  protected activityService = inject(ActivityService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ActivityMatchFormGroup = this.activityMatchFormService.createActivityMatchFormGroup();

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

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

    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      activityMatch.userName,
    );
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(
      this.usersSharedCollection,
      activityMatch.requestUser,
      activityMatch.matchedUser,
    );
    this.activitiesSharedCollection = this.activityService.addActivityToCollectionIfMissing<IActivity>(
      this.activitiesSharedCollection,
      activityMatch.matchedActivity,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(
        map((profiles: IProfile[]) =>
          this.profileService.addProfileToCollectionIfMissing<IProfile>(profiles, this.activityMatch?.userName),
        ),
      )
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(
        map((users: IUser[]) =>
          this.userService.addUserToCollectionIfMissing<IUser>(users, this.activityMatch?.requestUser, this.activityMatch?.matchedUser),
        ),
      )
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));

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
