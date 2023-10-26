import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';

import { createConnection } from '@helpers/connections/connectionsBusiness';
import { formatJSONResponse } from '@libs/api-gateway';
import { createLogger } from '@utils/logger';

const logger = createLogger('connectHandler');

const connectHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Creating new connection', { event });

    const connectionId = event.requestContext.connectionId;

    await createConnection(connectionId);

    return formatJSONResponse(200, {});
  } catch (e) {
    logger.error('Fail to create connection', { error: e });

    return formatJSONResponse(500, { message: e.message });
  }
};

export const main = connectHandler;
