import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { INotification, NewNotification } from '../notification.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts INotification for edit and NewNotificationFormGroupInput for create.
 */
type NotificationFormGroupInput = INotification | PartialWithRequiredKeyOf<NewNotification>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends INotification | NewNotification> = Omit<T, 'timestamp'> & {
  timestamp?: string | null;
};

type NotificationFormRawValue = FormValueOf<INotification>;

type NewNotificationFormRawValue = FormValueOf<NewNotification>;

type NotificationFormDefaults = Pick<NewNotification, 'id' | 'timestamp' | 'isRead'>;

type NotificationFormGroupContent = {
  id: FormControl<NotificationFormRawValue['id'] | NewNotification['id']>;
  notificationType: FormControl<NotificationFormRawValue['notificationType']>;
  title: FormControl<NotificationFormRawValue['title']>;
  message: FormControl<NotificationFormRawValue['message']>;
  timestamp: FormControl<NotificationFormRawValue['timestamp']>;
  isRead: FormControl<NotificationFormRawValue['isRead']>;
  userID: FormControl<NotificationFormRawValue['userID']>;
};

export type NotificationFormGroup = FormGroup<NotificationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class NotificationFormService {
  createNotificationFormGroup(notification: NotificationFormGroupInput = { id: null }): NotificationFormGroup {
    const notificationRawValue = this.convertNotificationToNotificationRawValue({
      ...this.getFormDefaults(),
      ...notification,
    });
    return new FormGroup<NotificationFormGroupContent>({
      id: new FormControl(
        { value: notificationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      notificationType: new FormControl(notificationRawValue.notificationType, {
        validators: [Validators.required],
      }),
      title: new FormControl(notificationRawValue.title, {
        validators: [Validators.required, Validators.minLength(1), Validators.maxLength(255)],
      }),
      message: new FormControl(notificationRawValue.message, {
        validators: [Validators.required, Validators.minLength(1), Validators.maxLength(1000)],
      }),
      timestamp: new FormControl(notificationRawValue.timestamp, {
        validators: [Validators.required],
      }),
      isRead: new FormControl(notificationRawValue.isRead, {
        validators: [Validators.required],
      }),
      userID: new FormControl(notificationRawValue.userID),
    });
  }

  getNotification(form: NotificationFormGroup): INotification | NewNotification {
    return this.convertNotificationRawValueToNotification(form.getRawValue() as NotificationFormRawValue | NewNotificationFormRawValue);
  }

  resetForm(form: NotificationFormGroup, notification: NotificationFormGroupInput): void {
    const notificationRawValue = this.convertNotificationToNotificationRawValue({ ...this.getFormDefaults(), ...notification });
    form.reset(
      {
        ...notificationRawValue,
        id: { value: notificationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): NotificationFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      timestamp: currentTime,
      isRead: false,
    };
  }

  private convertNotificationRawValueToNotification(
    rawNotification: NotificationFormRawValue | NewNotificationFormRawValue,
  ): INotification | NewNotification {
    return {
      ...rawNotification,
      timestamp: dayjs(rawNotification.timestamp, DATE_TIME_FORMAT),
    };
  }

  private convertNotificationToNotificationRawValue(
    notification: INotification | (Partial<NewNotification> & NotificationFormDefaults),
  ): NotificationFormRawValue | PartialWithRequiredKeyOf<NewNotificationFormRawValue> {
    return {
      ...notification,
      timestamp: notification.timestamp ? notification.timestamp.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
