import { APIGatewayProxyEvent } from 'aws-lambda';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { getUserId } from '@helpers/users/usersBusiness';
import { createLogger } from '@utils/logger';
import schema from './schema';
import { updateMessage } from '@helpers/messages/messagesBusiness';

const logger = createLogger('updateMessage');

const messages: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async event => {
  try {
    const messageId = event.pathParameters.messageId;
    const userId = getUserId(event as unknown as APIGatewayProxyEvent);
    const { text } = event.body;

    logger.info(`Updating a message ${messageId} for userId ${userId}`);

    const message = await updateMessage(userId, messageId, text);

    return formatJSONResponse(201, { message });
  } catch (e) {
    logger.error('Fail to update a message', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = middyfy(messages);
