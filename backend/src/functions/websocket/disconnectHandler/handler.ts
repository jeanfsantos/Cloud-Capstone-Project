import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';

import { deleteConnection } from '@helpers/connections/connectionsBusiness';
import { formatJSONResponse } from '@libs/api-gateway';
import { createLogger } from '@utils/logger';

const logger = createLogger('disconnectHandler');

const disconnectHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Deleting a connect', { event });

    const connectionId = event.requestContext.connectionId;

    await deleteConnection(connectionId);

    return formatJSONResponse(200, {});
  } catch (e) {
    logger.error('Fail to create connection', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = disconnectHandler;
