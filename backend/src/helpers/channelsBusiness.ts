import { randomUUID } from 'crypto';

import { Channel } from '@models/Channel';
import { createLogger } from '@utils/logger';
import { ChannelsDataAccess } from './channelsDataAccess';

const logger = createLogger('ChannelsBusiness');
const channelsDataAccess = new ChannelsDataAccess();

export async function createChannel(name: string): Promise<Channel> {
  try {
    logger.info('Creating new channel');

    const channelId = randomUUID();
    const newChannel = {
      id: channelId,
      name,
    } as Channel;

    const channel = await channelsDataAccess.createChannel(newChannel);

    return channel;
  } catch (e) {
    logger.error('Fail to create new channel', { error: e });
    throw e;
  }
}
