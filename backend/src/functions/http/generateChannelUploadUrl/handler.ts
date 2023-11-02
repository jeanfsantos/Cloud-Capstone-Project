import { APIGatewayProxyEvent } from 'aws-lambda';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import {
  createAttachmentPresignedUrl,
  getChannelByUserAndId,
} from '@helpers/channels/channelsBusiness';
import { getUserId } from '@helpers/users/usersBusiness';
import { createLogger } from '@utils/logger';
import schema from './schema';

const logger = createLogger('generateChannelUploadUrl');

const generateChannelUploadUrl: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async event => {
  try {
    logger.info(`Creating a image for channel`);

    const userId = getUserId(event as unknown as APIGatewayProxyEvent);
    const channelId = event.pathParameters.channelId;

    logger.info(`Validating channel and user`);

    await getChannelByUserAndId(userId, channelId);

    logger.info(`Creating a image for channel ${channelId} and user ${userId}`);

    const imageUrl = await createAttachmentPresignedUrl(userId, channelId);

    return formatJSONResponse(201, {
      imageUrl,
    });
  } catch (e) {
    logger.error('Fail to create a image for channel', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(generateChannelUploadUrl);
