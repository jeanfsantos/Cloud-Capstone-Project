import fetch from 'node-fetch';

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
