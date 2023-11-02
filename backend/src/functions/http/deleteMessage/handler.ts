import { APIGatewayProxyEvent } from 'aws-lambda';

import { deleteMessageById } from '@helpers/messages/messagesBusiness';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { getUserId } from '@helpers/users/usersBusiness';
import { createLogger } from '@utils/logger';
import schema from './schema';

const logger = createLogger('deleteMessage');

const messages: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async event => {
  try {
    const messageId = event.pathParameters.messageId;
    const userId = getUserId(event as APIGatewayProxyEvent);

    logger.info(`Deleting a message ${messageId} for userId ${userId}`);

    await deleteMessageById(userId, messageId);

    return formatJSONResponse(204, {});
  } catch (e) {
    logger.error('Fail to create new message', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(messages);
