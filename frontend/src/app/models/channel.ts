import { User } from './user';

export interface Channel {
  createdAt: string;
  user: User;
  channelId: string;
  name: string;
  userId: string;
  attachmentUrl?: string;
}
