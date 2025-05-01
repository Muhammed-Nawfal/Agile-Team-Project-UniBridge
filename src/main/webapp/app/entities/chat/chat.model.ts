import dayjs from 'dayjs/esm';
import { IMessageThread } from 'app/entities/message-thread/message-thread.model';
import { IProfile } from 'app/entities/profile/profile.model';
import { MessageStatus } from 'app/entities/enumerations/message-status.model';
import { MessageType } from 'app/entities/enumerations/message-type.model';

export interface IChat {
  id: number;
  message?: string | null;
  timestamp?: dayjs.Dayjs | null;
  status?: keyof typeof MessageStatus | null;
  type?: keyof typeof MessageType | null;
  media?: string | null;
  mediaContentType?: string | null;
  isDeleted?: boolean | null;
  createdOn?: dayjs.Dayjs | null;
  updatedOn?: dayjs.Dayjs | null;
  thread?: IMessageThread | null;
  sender?: IProfile | null;
  receiver?: IProfile | null;
  messageThread?: IMessageThread | null;
}

export type NewChat = Omit<IChat, 'id'> & { id: null };
