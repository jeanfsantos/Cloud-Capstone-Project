import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { createMessage } from '@helpers/messages/messagesBusiness';
import { Message } from '@models/Message';
import { createLogger } from '@utils/logger';
import schema from './schema';
import { getUser } from '@helpers/users/usersBusiness';

const logger = createLogger('createChannel');

const messages: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async event => {
  try {
    logger.info('Creating new message');

    const { channelId, text } = event.body;

    const user = await getUser(event.headers.Authorization);

    logger.info(`Creating new message: ${text} of user`, { user });

    const message: Message = await createMessage(channelId, text, user);

    return formatJSONResponse(201, {
      message,
    });
  } catch (e) {
    logger.error('Fail to create new message', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(messages);
