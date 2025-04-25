import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IMessageThread, NewMessageThread } from '../message-thread.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IMessageThread for edit and NewMessageThreadFormGroupInput for create.
 */
type MessageThreadFormGroupInput = IMessageThread | PartialWithRequiredKeyOf<NewMessageThread>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IMessageThread | NewMessageThread> = Omit<T, 'createdOn' | 'updatedOn'> & {
  createdOn?: string | null;
  updatedOn?: string | null;
};

type MessageThreadFormRawValue = FormValueOf<IMessageThread>;

type NewMessageThreadFormRawValue = FormValueOf<NewMessageThread>;

type MessageThreadFormDefaults = Pick<NewMessageThread, 'id' | 'isGroup' | 'createdOn' | 'updatedOn' | 'participants'>;

type MessageThreadFormGroupContent = {
  id: FormControl<MessageThreadFormRawValue['id'] | NewMessageThread['id']>;
  isGroup: FormControl<MessageThreadFormRawValue['isGroup']>;
  name: FormControl<MessageThreadFormRawValue['name']>;
  createdOn: FormControl<MessageThreadFormRawValue['createdOn']>;
  updatedOn: FormControl<MessageThreadFormRawValue['updatedOn']>;
  friendChat: FormControl<MessageThreadFormRawValue['friendChat']>;
  matchChat: FormControl<MessageThreadFormRawValue['matchChat']>;
  participants: FormControl<MessageThreadFormRawValue['participants']>;
};

export type MessageThreadFormGroup = FormGroup<MessageThreadFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class MessageThreadFormService {
  createMessageThreadFormGroup(messageThread: MessageThreadFormGroupInput = { id: null }): MessageThreadFormGroup {
    const messageThreadRawValue = this.convertMessageThreadToMessageThreadRawValue({
      ...this.getFormDefaults(),
      ...messageThread,
    });
    return new FormGroup<MessageThreadFormGroupContent>({
      id: new FormControl(
        { value: messageThreadRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      isGroup: new FormControl(messageThreadRawValue.isGroup, {
        validators: [Validators.required],
      }),
      name: new FormControl(messageThreadRawValue.name, {
        validators: [Validators.maxLength(100)],
      }),
      createdOn: new FormControl(messageThreadRawValue.createdOn, {
        validators: [Validators.required],
      }),
      updatedOn: new FormControl(messageThreadRawValue.updatedOn),
      friendChat: new FormControl(messageThreadRawValue.friendChat),
      matchChat: new FormControl(messageThreadRawValue.matchChat),
      participants: new FormControl(messageThreadRawValue.participants ?? []),
    });
  }

  getMessageThread(form: MessageThreadFormGroup): IMessageThread | NewMessageThread {
    return this.convertMessageThreadRawValueToMessageThread(form.getRawValue() as MessageThreadFormRawValue | NewMessageThreadFormRawValue);
  }

  resetForm(form: MessageThreadFormGroup, messageThread: MessageThreadFormGroupInput): void {
    const messageThreadRawValue = this.convertMessageThreadToMessageThreadRawValue({ ...this.getFormDefaults(), ...messageThread });
    form.reset(
      {
        ...messageThreadRawValue,
        id: { value: messageThreadRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): MessageThreadFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isGroup: false,
      createdOn: currentTime,
      updatedOn: currentTime,
      participants: [],
    };
  }

  private convertMessageThreadRawValueToMessageThread(
    rawMessageThread: MessageThreadFormRawValue | NewMessageThreadFormRawValue,
  ): IMessageThread | NewMessageThread {
    return {
      ...rawMessageThread,
      createdOn: dayjs(rawMessageThread.createdOn, DATE_TIME_FORMAT),
      updatedOn: dayjs(rawMessageThread.updatedOn, DATE_TIME_FORMAT),
    };
  }

  private convertMessageThreadToMessageThreadRawValue(
    messageThread: IMessageThread | (Partial<NewMessageThread> & MessageThreadFormDefaults),
  ): MessageThreadFormRawValue | PartialWithRequiredKeyOf<NewMessageThreadFormRawValue> {
    return {
      ...messageThread,
      createdOn: messageThread.createdOn ? messageThread.createdOn.format(DATE_TIME_FORMAT) : undefined,
      updatedOn: messageThread.updatedOn ? messageThread.updatedOn.format(DATE_TIME_FORMAT) : undefined,
      participants: messageThread.participants ?? [],
    };
  }
}
