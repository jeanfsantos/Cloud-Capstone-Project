import { User } from './user';

export interface Message {
  channelId: string;
  createdAt: string;
  messageId: string;
  text: string;
  user: User;
  userId: string;
}
