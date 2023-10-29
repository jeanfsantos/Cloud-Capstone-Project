import { randomUUID } from 'crypto';

import { Channel } from '@models/Channel';
import { User } from '@models/User';
import { createLogger } from '@utils/logger';
import { ChannelsDataAccess } from './channelsDataAccess';

const logger = createLogger('ChannelsBusiness');
const channelsDataAccess = new ChannelsDataAccess();

export async function createChannel(
  name: string,
  user: User,
): Promise<Channel> {
  try {
    logger.info('Creating new channel', { payload: name });

    const channelId = randomUUID();
    const newChannel = {
      id: channelId,
      name,
      user,
    } as Channel;

    const channel = await channelsDataAccess.createChannel(newChannel);

    return channel;
  } catch (e) {
    logger.error('Fail to create new channel', { error: e });
    throw e;
  }
}

export async function getChannels(): Promise<Channel[]> {
  try {
    logger.info('Getting channels');

    const channels = await channelsDataAccess.getChannels();

    return channels;
  } catch (e) {
    logger.error('Fail to get channels', { error: e });
    throw e;
  }
}
