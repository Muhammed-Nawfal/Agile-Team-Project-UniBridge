import { Component, OnInit, inject, NgZone } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { IChallenge } from '../challenge.model';
import { ChallengeService, EntityArrayResponseType } from '../service/challenge.service';
import { ChallengeDeleteDialogComponent } from '../delete/challenge-delete-dialog.component';

@Component({
  standalone: true,
  selector: 'jhi-challenge',
  templateUrl: './challenge.component.html',
  styleUrl: 'challenge.component.scss',
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    DurationPipe,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
  ],
})
export class ChallengeComponent implements OnInit {
  public readonly router = inject(Router);
  protected readonly challengeService = inject(ChallengeService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected readonly dataUtils = inject(DataUtils);
  protected readonly modalService = inject(NgbModal);
  protected readonly ngZone = inject(NgZone);
  private readonly fb = inject(FormBuilder);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  subscription: Subscription | null = null;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  challenges: IChallenge[] = [];
  // eslint-disable-next-line @typescript-eslint/member-ordering
  isLoading = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  challengeForm: FormGroup;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  sortState = sortStateSignal({});

  trackId = (item: IChallenge): number => this.challengeService.getChallengeIdentifier(item);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  constructor() {
    // Initialize the form with validators
    this.challengeForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      category: ['PERSONAL_GROWTH'], // Default value
      date: [''], // You might want to add date validators
      points: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
    });
  }

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!this.challenges || this.challenges.length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();
  }

  save(): void {
    if (this.challengeForm.valid) {
      // Implement challenge creation logic
      this.challengeService.create(this.challengeForm.value).subscribe({
        next: () => {
          // Handle successful creation
          this.load(); // Refresh the list of challenges
          this.challengeForm.reset({
            category: 'PERSONAL_GROWTH', // Reset to default
          });
        },
        error: err => {
          // Implement proper error handling
          this.handleError(err);
        },
      });
    }
  }

  private handleError(err: any): void {
    // Centralized error handling
    console.error('Challenge creation error', err);
    // TODO: Add user-friendly error notification
  }

  // byteSize(base64String: string): string {
  //   return this.dataUtils.byteSize(base64String);
  // }
  //
  // openFile(base64String: string, contentType: string | null | undefined): void {
  //   return this.dataUtils.openFile(base64String, contentType);
  // }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  delete(challenge: IChallenge): void {
    const modalRef = this.modalService.open(ChallengeDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.challenge = challenge;
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.challenges = this.refineData(dataFromBody);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  protected refineData(data: IChallenge[]): IChallenge[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  protected fillComponentAttributesFromResponseBody(data: IChallenge[] | null): IChallenge[] {
    return data ?? [];
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.challengeService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  protected handleNavigation(sortState: SortState): void {
    const queryParamsObj = {
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }
}
