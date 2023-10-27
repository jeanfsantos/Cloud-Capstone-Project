import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { createLogger } from '@utils/logger';
import schema from './schema';
import { getMessagesByChannel } from '@helpers/messages/messagesBusiness';
import { Message } from '@models/Message';

const logger = createLogger('getMessagesByChannel');

const messages: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async event => {
  try {
    logger.info('Getting messages by channel');

    const channelId = event.pathParameters.channelId;

    if (!channelId) {
      return formatJSONResponse(400, {
        message: 'Channel ID is missing',
      });
    }

    const messages: Message[] = await getMessagesByChannel(channelId);

    return formatJSONResponse(200, {
      messages,
    });
  } catch (e) {
    logger.error('Fail to get messages', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(messages);
