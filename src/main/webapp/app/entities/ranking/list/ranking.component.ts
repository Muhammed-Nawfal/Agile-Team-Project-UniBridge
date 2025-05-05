import { Component, NgZone, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IRanking } from '../ranking.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { EntityArrayResponseType, RankingService } from '../service/ranking.service';
import { RankingDeleteDialogComponent } from '../delete/ranking-delete-dialog.component';
import { AccountService } from '../../../core/auth/account.service';
import { IReview } from '../../review/review.model';

@Component({
  standalone: true,
  selector: 'jhi-ranking',
  templateUrl: './ranking.component.html',
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    DurationPipe,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
  ],
})
export class RankingComponent implements OnInit {
  subscription: Subscription | null = null;
  rankings?: IRanking[];
  isLoading = false;
  currentUsername = '';
  currentProfileId?: number;
  profiles: IProfile[] = [];
  selectedProfile?: IProfile;

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly rankingService = inject(RankingService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly profileService = inject(ProfileService);
  protected readonly accountService = inject(AccountService);

  getCurrentUserInfo(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.currentUsername = account.login;
        this.findCurrentProfileId();
      }
    });
  }

  findCurrentProfileId(): void {
    this.profileService.query().subscribe({
      next: res => {
        const profiles = res.body ?? [];
        const currentProfile = profiles.find(profile => profile.login === this.currentUsername);
        if (currentProfile) {
          this.currentProfileId = currentProfile.id;
        }
      },
    });
  }

  loadAllProfiles(): void {
    this.profileService.query().subscribe({
      next: res => {
        this.profiles = res.body ?? [];
      },
    });
  }

  trackId = (item: IRanking): number => this.rankingService.getRankingIdentifier(item);

  ngOnInit(): void {
    this.getCurrentUserInfo();
    this.loadAllProfiles();
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (!this.rankings || this.rankings.length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();
  }

  delete(ranking: IRanking): void {
    const modalRef = this.modalService.open(RankingDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.ranking = ranking;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.rankings = this.refineData(dataFromBody);
  }

  protected refineData(data: IRanking[]): IRanking[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IRanking[] | null): IRanking[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.rankingService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

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
