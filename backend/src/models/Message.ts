import { User } from './User';

export interface Message {
  channelId: string;
  text: string;
  timestamp: string;
  user: User;
}
