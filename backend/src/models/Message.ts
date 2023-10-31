import { User } from './User';

export interface Message {
  messageId: string;
  channelId: string;
  text: string;
  timestamp: string;
  user: User;
}
