import { APIGatewayProxyEvent } from 'aws-lambda';
import { decode } from 'jsonwebtoken';

import { createLogger } from './logger';

const logger = createLogger('getUserId');

interface JwtPayload {
  iss: string;
  sub: string;
  iat: number;
  exp: number;
}

function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload;
  return decodedJwt.sub;
}

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  logger.info(
    `Getting user id from Authorization Header ${event.headers.Authorization}`,
  );

  const authorization = event.headers.Authorization;
  const [, jwtToken] = authorization.split(' ');

  const userId = parseUserId(jwtToken);

  logger.info(`userId: ${userId}`);

  return userId;
}
