import { randomUUID } from 'crypto';

import { Channel } from '@models/Channel';
import { User } from '@models/User';
import { createLogger } from '@utils/logger';
import { ChannelsDataAccess } from './channelsDataAccess';
import { AttachmentUtils } from '@helpers/attachment/attachmentUtils';

const logger = createLogger('ChannelsBusiness');
const channelsDataAccess = new ChannelsDataAccess();
const attachmentUtils = new AttachmentUtils();

export async function createChannel(
  name: string,
  user: User,
): Promise<Channel> {
  try {
    logger.info('Creating new channel', { payload: name });

    const channelId = randomUUID();
    const newChannel = {
      channelId,
      name,
      user,
      userId: user.sub,
      createdAt: String(new Date().getTime()),
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

export async function getChannelByUserAndId(
  userId: string,
  channelId: string,
): Promise<Channel> {
  try {
    logger.info(`Getting a channel ${channelId} by user ${userId}`);

    const channel = await channelsDataAccess.getChannelByUserAndId(
      userId,
      channelId,
    );

    return channel;
  } catch (e) {
    logger.error('Fail to get channel by user', { error: e });
    throw e;
  }
}

export async function createAttachmentPresignedUrl(
  userId: string,
  channelId: string,
): Promise<String> {
  try {
    logger.info('Creating attachment presign url');

    const uploadUrl = await attachmentUtils.getUploadUrl(channelId);
    logger.info(`Upload url is ${uploadUrl}`);

    const attachmentUrl = attachmentUtils.getAttachmentUrl(channelId);
    logger.info(`AttachmentUrl is ${attachmentUrl}`);

    await channelsDataAccess.updateAttachmentUrl(
      userId,
      channelId,
      attachmentUrl,
    );
    logger.info(
      `Updated attachment url for channel ${channelId} of user ${userId}`,
    );

    return uploadUrl;
  } catch (e) {
    logger.error(`Fail to create attachment presign url`);
    throw e;
  }
}
