import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { createChannel } from '@helpers/channelsBusiness';
import { Channel } from '@models/Channel';
import { createLogger } from '@utils/logger';
import schema from './schema';

const logger = createLogger('createChannel');

const channels: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async event => {
  try {
    logger.info('Creating new channel');

    const { name } = event.body;

    const channel: Channel = await createChannel(name);

    return formatJSONResponse(201, {
      channel,
    });
  } catch (e) {
    logger.error('Fail to create new channel', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(channels);
