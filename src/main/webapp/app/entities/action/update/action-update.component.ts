import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ActionType } from 'app/entities/enumerations/action-type.model';
import { ActionService } from '../service/action.service';
import { IAction } from '../action.model';
import { ActionFormGroup, ActionFormService } from './action-form.service';

@Component({
  standalone: true,
  selector: 'jhi-action-update',
  templateUrl: './action-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ActionUpdateComponent implements OnInit {
  isSaving = false;
  action: IAction | null = null;
  actionTypeValues = Object.keys(ActionType);

  usersSharedCollection: IUser[] = [];

  protected actionService = inject(ActionService);
  protected actionFormService = inject(ActionFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ActionFormGroup = this.actionFormService.createActionFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ action }) => {
      this.action = action;
      if (action) {
        this.updateForm(action);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const action = this.actionFormService.getAction(this.editForm);
    if (action.id !== null) {
      this.subscribeToSaveResponse(this.actionService.update(action));
    } else {
      this.subscribeToSaveResponse(this.actionService.create(action));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAction>>): void {
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

  protected updateForm(action: IAction): void {
    this.action = action;
    this.actionFormService.resetForm(this.editForm, action);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(
      this.usersSharedCollection,
      action.performedByID,
      action.targetUserID,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(
        map((users: IUser[]) =>
          this.userService.addUserToCollectionIfMissing<IUser>(users, this.action?.performedByID, this.action?.targetUserID),
        ),
      )
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
