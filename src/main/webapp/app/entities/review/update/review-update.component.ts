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
import { ReviewService } from '../service/review.service';
import { IReview } from '../review.model';
import { ReviewFormGroup, ReviewFormService } from './review-form.service';

@Component({
  standalone: true,
  selector: 'jhi-review-update',
  templateUrl: './review-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ReviewUpdateComponent implements OnInit {
  isSaving = false;
  review: IReview | null = null;

  profilesSharedCollection: IProfile[] = [];
  usersSharedCollection: IUser[] = [];

  protected reviewService = inject(ReviewService);
  protected reviewFormService = inject(ReviewFormService);
  protected profileService = inject(ProfileService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ReviewFormGroup = this.reviewFormService.createReviewFormGroup();

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ review }) => {
      this.review = review;
      if (review) {
        this.updateForm(review);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const review = this.reviewFormService.getReview(this.editForm);
    if (review.id !== null) {
      this.subscribeToSaveResponse(this.reviewService.update(review));
    } else {
      this.subscribeToSaveResponse(this.reviewService.create(review));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IReview>>): void {
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

  protected updateForm(review: IReview): void {
    this.review = review;
    this.reviewFormService.resetForm(this.editForm, review);

    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      review.reviewsGiven,
    );
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(
      this.usersSharedCollection,
      review.aboutUser,
      review.fromUser,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(
        map((profiles: IProfile[]) => this.profileService.addProfileToCollectionIfMissing<IProfile>(profiles, this.review?.reviewsGiven)),
      )
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(
        map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.review?.aboutUser, this.review?.fromUser)),
      )
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
