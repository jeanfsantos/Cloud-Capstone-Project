import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { createMessage } from '@helpers/messages/messagesBusiness';
import { Message } from '@models/Message';
import { createLogger } from '@utils/logger';
import schema from './schema';

const logger = createLogger('createChannel');

const messages: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async event => {
  try {
    logger.info('Creating new message');

    const { channelId, text } = event.body;

    const message: Message = await createMessage(channelId, text);

    return formatJSONResponse(201, {
      message,
    });
  } catch (e) {
    logger.error('Fail to create new message', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(messages);
