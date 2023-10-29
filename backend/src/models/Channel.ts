import { User } from './User';

export interface Channel {
  id: string;
  name: string;
  user: User;
}
