import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { Decision } from 'app/entities/enumerations/decision.model';
import { FriendsListService } from '../service/friends-list.service';
import { IFriendsList } from '../friends-list.model';
import { FriendsListFormGroup, FriendsListFormService } from './friends-list-form.service';

@Component({
  standalone: true,
  selector: 'jhi-friends-list-update',
  templateUrl: './friends-list-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class FriendsListUpdateComponent implements OnInit {
  isSaving = false;
  friendsList: IFriendsList | null = null;
  decisionValues = Object.keys(Decision);

  profilesSharedCollection: IProfile[] = [];

  protected friendsListService = inject(FriendsListService);
  protected friendsListFormService = inject(FriendsListFormService);
  protected profileService = inject(ProfileService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: FriendsListFormGroup = this.friendsListFormService.createFriendsListFormGroup();

  compareProfile = (o1: IProfile | null, o2: IProfile | null): boolean => this.profileService.compareProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ friendsList }) => {
      this.friendsList = friendsList;
      if (friendsList) {
        this.updateForm(friendsList);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const friendsList = this.friendsListFormService.getFriendsList(this.editForm);
    if (friendsList.id !== null) {
      this.subscribeToSaveResponse(this.friendsListService.update(friendsList));
    } else {
      this.subscribeToSaveResponse(this.friendsListService.create(friendsList));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFriendsList>>): void {
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

  protected updateForm(friendsList: IFriendsList): void {
    this.friendsList = friendsList;
    this.friendsListFormService.resetForm(this.editForm, friendsList);

    this.profilesSharedCollection = this.profileService.addProfileToCollectionIfMissing<IProfile>(
      this.profilesSharedCollection,
      friendsList.requestedByProfile,
      friendsList.requestedToProfile,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.profileService
      .query()
      .pipe(map((res: HttpResponse<IProfile[]>) => res.body ?? []))
      .pipe(
        map((profiles: IProfile[]) =>
          this.profileService.addProfileToCollectionIfMissing<IProfile>(
            profiles,
            this.friendsList?.requestedByProfile,
            this.friendsList?.requestedToProfile,
          ),
        ),
      )
      .subscribe((profiles: IProfile[]) => (this.profilesSharedCollection = profiles));
  }
}
