import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IChat, NewChat } from '../chat.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IChat for edit and NewChatFormGroupInput for create.
 */
type ChatFormGroupInput = IChat | PartialWithRequiredKeyOf<NewChat>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IChat | NewChat> = Omit<T, 'timestamp' | 'createdOn' | 'updatedOn'> & {
  timestamp?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
};

type ChatFormRawValue = FormValueOf<IChat>;

type NewChatFormRawValue = FormValueOf<NewChat>;

type ChatFormDefaults = Pick<NewChat, 'id' | 'timestamp' | 'isDeleted' | 'createdOn' | 'updatedOn'>;

type ChatFormGroupContent = {
  id: FormControl<ChatFormRawValue['id'] | NewChat['id']>;
  message: FormControl<ChatFormRawValue['message']>;
  timestamp: FormControl<ChatFormRawValue['timestamp']>;
  status: FormControl<ChatFormRawValue['status']>;
  type: FormControl<ChatFormRawValue['type']>;
  media: FormControl<ChatFormRawValue['media']>;
  mediaContentType: FormControl<ChatFormRawValue['mediaContentType']>;
  isDeleted: FormControl<ChatFormRawValue['isDeleted']>;
  createdOn: FormControl<ChatFormRawValue['createdOn']>;
  updatedOn: FormControl<ChatFormRawValue['updatedOn']>;
  thread: FormControl<ChatFormRawValue['thread']>;
  sender: FormControl<ChatFormRawValue['sender']>;
  receiver: FormControl<ChatFormRawValue['receiver']>;
  messageThread: FormControl<ChatFormRawValue['messageThread']>;
};

export type ChatFormGroup = FormGroup<ChatFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ChatFormService {
  createChatFormGroup(chat: ChatFormGroupInput = { id: null }): ChatFormGroup {
    const chatRawValue = this.convertChatToChatRawValue({
      ...this.getFormDefaults(),
      ...chat,
    });
    return new FormGroup<ChatFormGroupContent>({
      id: new FormControl(
        { value: chatRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      message: new FormControl(chatRawValue.message),
      timestamp: new FormControl(chatRawValue.timestamp, {
        validators: [Validators.required],
      }),
      status: new FormControl(chatRawValue.status, {
        validators: [Validators.required],
      }),
      type: new FormControl(chatRawValue.type, {
        validators: [Validators.required],
      }),
      media: new FormControl(chatRawValue.media),
      mediaContentType: new FormControl(chatRawValue.mediaContentType),
      isDeleted: new FormControl(chatRawValue.isDeleted, {
        validators: [Validators.required],
      }),
      createdOn: new FormControl(chatRawValue.createdOn, {
        validators: [Validators.required],
      }),
      updatedOn: new FormControl(chatRawValue.updatedOn),
      thread: new FormControl(chatRawValue.thread),
      sender: new FormControl(chatRawValue.sender),
      receiver: new FormControl(chatRawValue.receiver),
      messageThread: new FormControl(chatRawValue.messageThread),
    });
  }

  getChat(form: ChatFormGroup): IChat | NewChat {
    return this.convertChatRawValueToChat(form.getRawValue() as ChatFormRawValue | NewChatFormRawValue);
  }

  resetForm(form: ChatFormGroup, chat: ChatFormGroupInput): void {
    const chatRawValue = this.convertChatToChatRawValue({ ...this.getFormDefaults(), ...chat });
    form.reset(
      {
        ...chatRawValue,
        id: { value: chatRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ChatFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      timestamp: currentTime,
      isDeleted: false,
      createdOn: currentTime,
      updatedOn: currentTime,
    };
  }

  private convertChatRawValueToChat(rawChat: ChatFormRawValue | NewChatFormRawValue): IChat | NewChat {
    return {
      ...rawChat,
      timestamp: dayjs(rawChat.timestamp, DATE_TIME_FORMAT),
      createdOn: dayjs(rawChat.createdOn, DATE_TIME_FORMAT),
      updatedOn: dayjs(rawChat.updatedOn, DATE_TIME_FORMAT),
    };
  }

  private convertChatToChatRawValue(
    chat: IChat | (Partial<NewChat> & ChatFormDefaults),
  ): ChatFormRawValue | PartialWithRequiredKeyOf<NewChatFormRawValue> {
    return {
      ...chat,
      timestamp: chat.timestamp ? chat.timestamp.format(DATE_TIME_FORMAT) : undefined,
      createdOn: chat.createdOn ? chat.createdOn.format(DATE_TIME_FORMAT) : undefined,
      updatedOn: chat.updatedOn ? chat.updatedOn.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
