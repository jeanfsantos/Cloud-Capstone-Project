import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { getChannelsByUserId } from '@helpers/channels/channelsBusiness';
import { getUserId } from '@helpers/users/usersBusiness';
import { Channel } from '@models/Channel';
import { createLogger } from '@utils/logger';
import schema from './schema';

const logger = createLogger('getMyChannels');

const channels: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async event => {
  try {
    const userId = getUserId(event as unknown as APIGatewayProxyEvent);

    logger.info(`Getting channels by user ${userId}`);

    const channels: Channel[] = await getChannelsByUserId(userId);

    return formatJSONResponse(200, {
      channels,
    });
  } catch (e) {
    logger.error('Fail to get channels by user', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(channels);
