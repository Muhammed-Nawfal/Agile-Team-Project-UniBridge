import { Pipe, PipeTransform } from '@angular/core';
import { IActivity } from './activity.model';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import { Status } from 'app/entities/enumerations/status.model';

export interface ActivityFilter {
  searchText?: string;
  location?: string;
  activityType?: (keyof typeof ActivityType)[];
  status?: (keyof typeof Status)[];
  isPaid?: boolean | null; // Can be true, false, or null (for "any")
  dateFrom?: Date | null;
  dateTo?: Date | null;
  minCost?: number | null;
  maxCost?: number | null;
}

@Pipe({
  name: 'activityFilter',
  standalone: true,
})
export class ActivityFilterPipe implements PipeTransform {
  transform(activities: IActivity[] | undefined, filters: ActivityFilter): IActivity[] {
    if (!activities) return [];
    if (Object.keys(filters).length === 0) return activities;

    return activities.filter(activity => {
      // Search text filter (checks name, location, and description)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const nameMatch = activity.activityName?.toLowerCase().includes(searchLower) ?? false;
        const locationMatch = activity.location?.toLowerCase().includes(searchLower) ?? false;
        const descriptionMatch = activity.description?.toLowerCase().includes(searchLower) ?? false;

        if (!nameMatch && !locationMatch && !descriptionMatch) {
          return false;
        }
      }

      // Location filter
      if (filters.location && activity.location && !activity.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Activity type filter
      if (
        filters.activityType &&
        filters.activityType.length > 0 &&
        activity.activityType &&
        !filters.activityType.includes(activity.activityType)
      ) {
        return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0 && activity.status && !filters.status.includes(activity.status)) {
        return false;
      }

      // Paid/Free filter
      if (filters.isPaid !== null && filters.isPaid !== undefined) {
        if (filters.isPaid && !activity.activityCost) {
          return false;
        }
        if (!filters.isPaid && activity.activityCost && activity.activityCost > 0) {
          return false;
        }
      }

      // Cost range filter
      if (
        filters.minCost !== null &&
        filters.minCost !== undefined &&
        activity.activityCost !== null &&
        activity.activityCost !== undefined &&
        activity.activityCost < filters.minCost
      ) {
        return false;
      }

      if (
        filters.maxCost !== null &&
        filters.maxCost !== undefined &&
        activity.activityCost !== null &&
        activity.activityCost !== undefined &&
        activity.activityCost > filters.maxCost
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && activity.activityDate && activity.activityDate.toDate() < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && activity.activityDate && activity.activityDate.toDate() > filters.dateTo) {
        return false;
      }

      // If it passed all filter conditions
      return true;
    });
  }
}
