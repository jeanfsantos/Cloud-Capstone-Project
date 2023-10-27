import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { getChannels } from '@helpers/channels/channelsBusiness';
import { Channel } from '@models/Channel';
import { createLogger } from '@utils/logger';
import schema from './schema';

const logger = createLogger('getChannels');

const channels: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async event => {
  try {
    logger.info('Getting channels');

    const channels: Channel[] = await getChannels();

    return formatJSONResponse(200, {
      channels,
    });
  } catch (e) {
    logger.error('Fail to get channels', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(channels);
