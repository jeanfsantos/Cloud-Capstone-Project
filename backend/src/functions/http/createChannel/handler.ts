import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { createChannel } from '@helpers/channels/channelsBusiness';
import { getUser } from '@helpers/users/usersBusiness';
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

    const user = await getUser(event.headers.Authorization);

    logger.info(`Creating new channel: ${name} of user`, { user });

    const channel: Channel = await createChannel(name, user);

    return formatJSONResponse(201, {
      channel,
    });
  } catch (e) {
    logger.error('Fail to create new channel', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(channels);
