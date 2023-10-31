import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { verify } from 'jsonwebtoken';

import { JwtToken } from '@models/JwtToken';
import { createLogger } from '@utils/logger';

const logger = createLogger('Auth0Authorizer');

const cert = `<AUTH0 SIGNING CERTIFICATE>`;

const Auth0Authorizer = async (
  event: CustomAuthorizerEvent,
): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken = verifyToken(event.authorizationToken);
    logger.info('User was authorized', { decodedToken });

    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
    };
  } catch (e) {
    logger.info('User was not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*',
          },
        ],
      },
    };
  }
};

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authorization header');
  }

  const split = authHeader.split(' ');
  const token = split[1];

  return verify(token, cert, {
    algorithms: ['RS256'],
  }) as JwtToken;
}

export const main = Auth0Authorizer;
