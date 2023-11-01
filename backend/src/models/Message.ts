import { User } from './User';

export interface Message {
  messageId: string;
  channelId: string;
  text: string;
  createdAt: string;
  user: User;
  userId: string;
}
