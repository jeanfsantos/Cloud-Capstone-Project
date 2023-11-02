import { User } from './User';

export interface Channel {
  channelId: string;
  name: string;
  user: User;
  userId: string;
  createdAt: string;
  imageUrl?: string;
}
