// import { Component, NgZone, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
// import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
// import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
//
// import SharedModule from 'app/shared/shared.module';
// import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
// import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
// import { FormsModule } from '@angular/forms';
// import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
// import { DataUtils } from 'app/core/util/data-util.service';
// import { IActivity } from '../activity.model';
// import { ActivityService, EntityArrayResponseType } from '../service/activity.service';
// import { ActivityDeleteDialogComponent } from '../delete/activity-delete-dialog.component';
// import { ActivityFilter, ActivityFilterPipe } from '../activity-filter.pipe';
// import { Status } from '../../enumerations/status.model';
// import { ActivityType } from '../../enumerations/activity-type.model';
// import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
// import {
//   faFilter,
//   faTimes,
//   faChevronUp,
//   faChevronDown,
//   faSearch,
//   faMapMarkerAlt,
//   faUsers,
//   faPlus,
//   faCheck,
//   faCalendarAlt,
//   faDollarSign,
//   faHandHoldingDollar,
//   faUser,
//   faImage,
// } from '@fortawesome/free-solid-svg-icons';
// import { ProfileService } from '../../profile/service/profile.service';
// import { AccountService } from '../../../core/auth/account.service';
//
// @Component({
//   standalone: true,
//   selector: 'jhi-activity',
//   templateUrl: './activity.component.html',
//   styleUrl: 'activity.component.scss',
//   imports: [
//     RouterModule,
//     FormsModule,
//     SharedModule,
//     SortDirective,
//     SortByDirective,
//     DurationPipe,
//     FormatMediumDatetimePipe,
//     FormatMediumDatePipe,
//     ActivityFilterPipe,
//   ],
// })
// export class ActivityComponent implements OnInit {
//   subscription: Subscription | null = null;
//   activities?: IActivity[];
//   isLoading = false;
//   currentSearch = '';
//
//   // For filtering
//   activityTypes = Object.values(ActivityType).filter(value => typeof value === 'string') as (keyof typeof ActivityType)[];
//   statusTypes = Object.values(Status).filter(value => typeof value === 'string') as (keyof typeof Status)[];
//
//   // Update the filters property in your ActivityComponent class to match the ActivityFilter interface
//   filters: ActivityFilter = {
//     searchText: '',
//     location: '',
//     activityType: [],
//     status: [],
//     isPaid: null,
//     dateFrom: null,
//     dateTo: null,
//     minCost: null,
//     maxCost: null,
//     creatorId: null,
//   };
//   showFilters = false;
//
//   sortState = sortStateSignal({});
//
//   @ViewChild('searchInput') searchInput!: ElementRef;
//
//   public readonly router = inject(Router);
//   protected readonly activityService = inject(ActivityService);
//   protected readonly activatedRoute = inject(ActivatedRoute);
//   protected readonly sortService = inject(SortService);
//   protected dataUtils = inject(DataUtils);
//   protected modalService = inject(NgbModal);
//   protected ngZone = inject(NgZone);
//   protected readonly faFilter = faFilter;
//   protected readonly faTimes = faTimes;
//   protected readonly faSearch = faSearch;
//   protected readonly faMapMarkerAlt = faMapMarkerAlt;
//   protected readonly faPlus = faPlus;
//
//   protected readonly faCheck = faCheck;
//   protected readonly faCalendarAlt = faCalendarAlt;
//   protected readonly faUsers = faUsers;
//   protected readonly faDollarSign = faDollarSign;
//   protected readonly faHandHoldingDollar = faHandHoldingDollar;
//   protected readonly faUser = faUser;
//   protected readonly faImage = faImage;
//
//   // Add this to your constructor
//   constructor(
//     private iconLibrary: FaIconLibrary,
//     private profileService: ProfileService,
//     private accountService: AccountService,
//   ) {
//     // Add all icons that your component needs
//     iconLibrary.addIcons(faFilter, faTimes, faChevronUp, faChevronDown, faSearch, faMapMarkerAlt, faUsers);
//   }
//
//   trackId = (item: IActivity): number => this.activityService.getActivityIdentifier(item);
//
//   ngOnInit(): void {
//     this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
//       .pipe(
//         tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
//         tap(() => {
//           if (!this.activities || this.activities.length === 0) {
//             this.load();
//           }
//         }),
//       )
//       .subscribe();
//   }
//
//   byteSize(base64String: string): string {
//     return this.dataUtils.byteSize(base64String);
//   }
//
//   openFile(base64String: string, contentType: string | null | undefined): void {
//     return this.dataUtils.openFile(base64String, contentType);
//   }
//
//   delete(activity: IActivity): void {
//     const modalRef = this.modalService.open(ActivityDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
//     modalRef.componentInstance.activity = activity;
//     // unsubscribe not needed because closed completes on modal close
//     modalRef.closed
//       .pipe(
//         filter(reason => reason === ITEM_DELETED_EVENT),
//         tap(() => this.load()),
//       )
//       .subscribe();
//   }
//
//   // Update the search method to integrate with the filter
//   search(query: string): void {
//     this.filters.searchText = query;
//     this.currentSearch = query;
//     this.load();
//   }
//
//   // Toggle filter method (already in your component)
//   toggleFilters(): void {
//     this.showFilters = !this.showFilters;
//   }
//
//   // Clear all filters (already in your component)
//   clearFilters(): void {
//     this.filters = {
//       searchText: '',
//       location: '',
//       activityType: [],
//       status: [],
//       isPaid: null,
//       dateFrom: null,
//       dateTo: null,
//       minCost: null,
//       maxCost: null,
//     };
//     this.currentSearch = '';
//     this.load();
//   }
//
//   // Toggle activity type selection (already in your component)
//   toggleActivityType(type: keyof typeof ActivityType): void {
//     const index = this.filters.activityType?.indexOf(type) ?? -1;
//     if (index === -1) {
//       this.filters.activityType?.push(type);
//     } else {
//       this.filters.activityType?.splice(index, 1);
//     }
//   }
//
//   // Toggle status selection
//   toggleStatus(status: keyof typeof Status): void {
//     const index = this.filters.status?.indexOf(status) ?? -1;
//     if (index === -1) {
//       this.filters.status?.push(status);
//     } else {
//       this.filters.status?.splice(index, 1);
//     }
//   }
//
//   // Check if a type is selected
//   isTypeSelected(type: keyof typeof ActivityType): boolean {
//     return this.filters.activityType?.includes(type) ?? false;
//   }
//
//   // Check if a status is selected
//   isStatusSelected(status: keyof typeof Status): boolean {
//     return this.filters.status?.includes(status) ?? false;
//   }
//
//   load(): void {
//     this.queryBackend().subscribe({
//       next: (res: EntityArrayResponseType) => {
//         this.onResponseSuccess(res);
//       },
//     });
//   }
//
//   navigateToWithComponentValues(event: SortState): void {
//     this.handleNavigation(event);
//   }
//
//   protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
//     this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
//   }
//
//   protected onResponseSuccess(response: EntityArrayResponseType): void {
//     const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
//     this.activities = this.refineData(dataFromBody);
//   }
//
//   protected refineData(data: IActivity[]): IActivity[] {
//     const { predicate, order } = this.sortState();
//     return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
//   }
//
//   protected fillComponentAttributesFromResponseBody(data: IActivity[] | null): IActivity[] {
//     return data ?? [];
//   }
//
//   protected queryBackend(): Observable<EntityArrayResponseType> {
//     this.isLoading = true;
//     // Handle both regular listing and search
//     if (this.currentSearch) {
//       return this.activityService.search(this.currentSearch).pipe(tap(() => (this.isLoading = false)));
//     } else {
//       const queryObject: any = {
//         sort: this.sortService.buildSortParam(this.sortState()),
//       };
//       return this.activityService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
//     }
//   }
//
//   protected handleNavigation(sortState: SortState): void {
//     const queryParamsObj = {
//       sort: this.sortService.buildSortParam(sortState),
//     };
//
//     this.ngZone.run(() => {
//       this.router.navigate(['./'], {
//         relativeTo: this.activatedRoute,
//         queryParams: queryParamsObj,
//       });
//     });
//   }
// }
import { Component, NgZone, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { IActivity } from '../activity.model';
import { ActivityService, EntityArrayResponseType } from '../service/activity.service';
import { ActivityDeleteDialogComponent } from '../delete/activity-delete-dialog.component';
import { ActivityFilter, ActivityFilterPipe } from '../activity-filter.pipe';
import { Status } from '../../enumerations/status.model';
import { ActivityType } from '../../enumerations/activity-type.model';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faFilter,
  faTimes,
  faChevronUp,
  faChevronDown,
  faSearch,
  faMapMarkerAlt,
  faUsers,
  faPlus,
  faCheck,
  faCalendarAlt,
  faDollarSign,
  faHandHoldingDollar,
  faUser,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from '../../profile/service/profile.service';
import { AccountService } from '../../../core/auth/account.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs'; // Import Subject, debounceTime, distinctUntilChanged

@Component({
  standalone: true,
  selector: 'jhi-activity',
  templateUrl: './activity.component.html',
  styleUrl: 'activity.component.scss',
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    DurationPipe,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
    ActivityFilterPipe,
  ],
})
export class ActivityComponent implements OnInit {
  subscription: Subscription | null = null;
  activities?: IActivity[];
  isLoading = false;
  currentSearch = '';

  // For filtering
  activityTypes = Object.values(ActivityType).filter(value => typeof value === 'string') as (keyof typeof ActivityType)[];
  statusTypes = Object.values(Status).filter(value => typeof value === 'string') as (keyof typeof Status)[];

  // Update the filters property in your ActivityComponent class to match the ActivityFilter interface
  filters: ActivityFilter = {
    searchText: '',
    location: '',
    activityType: [],
    status: [],
    isPaid: null,
    dateFrom: null,
    dateTo: null,
    minCost: null,
    maxCost: null,
    creatorId: null,
  };
  showFilters = false;

  sortState = sortStateSignal({});

  @ViewChild('searchInput') searchInput!: ElementRef;

  public readonly router = inject(Router);
  protected readonly activityService = inject(ActivityService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly faFilter = faFilter;
  protected readonly faTimes = faTimes;
  protected readonly faSearch = faSearch;
  protected readonly faMapMarkerAlt = faMapMarkerAlt;
  protected readonly faPlus = faPlus;

  protected readonly faCheck = faCheck;
  protected readonly faCalendarAlt = faCalendarAlt;
  protected readonly faUsers = faUsers;
  protected readonly faDollarSign = faDollarSign;
  protected readonly faHandHoldingDollar = faHandHoldingDollar;
  protected readonly faUser = faUser;
  protected readonly faImage = faImage;

  // Add a Subject to handle search input changes with debounce
  private searchInput$ = new Subject<string>();

  // Add this to your constructor
  constructor(
    private iconLibrary: FaIconLibrary,
    private profileService: ProfileService,
    private accountService: AccountService,
  ) {
    // Add all icons that your component needs
    iconLibrary.addIcons(faFilter, faTimes, faChevronUp, faChevronDown, faSearch, faMapMarkerAlt, faUsers);
  }

  trackId = (item: IActivity): number => this.activityService.getActivityIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (!this.activities || this.activities.length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();

    // Subscribe to the search input changes with debounce
    this.searchInput$
      .pipe(
        debounceTime(300), // Wait 300ms after the last input event
        distinctUntilChanged(), // Only emit if the current value is different from the last emitted value
        tap(query => {
          this.filters.searchText = query;
          this.currentSearch = query;
          this.load(); // Reload activities with the updated filter
        }),
      )
      .subscribe();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(activity: IActivity): void {
    const modalRef = this.modalService.open(ActivityDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.activity = activity;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  // Update the search method to emit to the searchInput$ Subject
  search(query: string): void {
    this.searchInput$.next(query);
  }

  // Toggle filter method (already in your component)
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Clear all filters (already in your component)
  clearFilters(): void {
    this.filters = {
      searchText: '',
      location: '',
      activityType: [],
      status: [],
      isPaid: null,
      dateFrom: null,
      dateTo: null,
      minCost: null,
      maxCost: null,
    };
    this.currentSearch = '';
    this.load();
  }

  // Toggle activity type selection (already in your component)
  toggleActivityType(type: keyof typeof ActivityType): void {
    const index = this.filters.activityType?.indexOf(type) ?? -1;
    if (index === -1) {
      this.filters.activityType?.push(type);
    } else {
      this.filters.activityType?.splice(index, 1);
    }
  }

  // Toggle status selection
  toggleStatus(status: keyof typeof Status): void {
    const index = this.filters.status?.indexOf(status) ?? -1;
    if (index === -1) {
      this.filters.status?.push(status);
    } else {
      this.filters.status?.splice(index, 1);
    }
  }

  // Check if a type is selected
  isTypeSelected(type: keyof typeof ActivityType): boolean {
    return this.filters.activityType?.includes(type) ?? false;
  }

  // Check if a status is selected
  isStatusSelected(status: keyof typeof Status): boolean {
    return this.filters.status?.includes(status) ?? false;
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
    this.activities = this.refineData(dataFromBody);
  }

  protected refineData(data: IActivity[]): IActivity[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IActivity[] | null): IActivity[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    // Apply the filters when querying the backend
    const queryParams: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
      'activityName.contains': this.filters.searchText ?? undefined,
      'location.contains': this.filters.location ?? undefined,
      activityType: this.filters.activityType,
      status: this.filters.status,
      isPaid: this.filters.isPaid,
      'activityCost.greaterThanOrEqual': this.filters.minCost,
      'activityCost.lessThanOrEqual': this.filters.maxCost,
      'activityDate.greaterThanOrEqual': this.filters.dateFrom ? this.filters.dateFrom.toISOString().split('T')[0] : undefined,
      'activityDate.lessThanOrEqual': this.filters.dateTo ? this.filters.dateTo.toISOString().split('T')[0] : undefined,
      'creatorId.equals': this.filters.creatorId,
      // Add other filter parameters as needed based on your backend API
    };

    // Remove undefined properties from the queryParams
    return this.activityService.query(queryParams).pipe(tap(() => (this.isLoading = false)));
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
