import { APIGatewayProxyEvent } from 'aws-lambda';
import { decode } from 'jsonwebtoken';
import fetch from 'node-fetch';

import { JwtToken } from '@models/JwtToken';
import { User } from '@models/User';
import { createLogger } from '@utils/logger';

const logger = createLogger('Users');

export async function getUser(bearerToken: string): Promise<User> {
  try {
    logger.info('Getting user');

    const response = await fetch(`${process.env.API_AUTH0}/userinfo`, {
      headers: {
        Authorization: bearerToken,
      },
    });

    const data = response.json();

    return data as unknown as User;
  } catch (e) {
    logger.error('Fail to get user', { error: e });
    throw e;
  }
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

function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtToken;
  return decodedJwt.sub;
}
