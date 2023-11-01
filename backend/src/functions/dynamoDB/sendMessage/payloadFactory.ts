import { DynamoDBRecord } from 'aws-lambda';

import { Message } from '@models/Message';
import { createLogger } from '@utils/logger';

const logger = createLogger('payloadFactory');

export interface PayloadResponse {
  eventName: 'INSERT' | 'REMOVE';
  payload: any;
}

abstract class Payload {
  constructor(protected readonly record: DynamoDBRecord) {}

  abstract create(): PayloadResponse;
}

class RemovePayload extends Payload {
  create(): PayloadResponse {
    try {
      return {
        eventName: 'REMOVE',
        payload: {
          messageId: this.record.dynamodb.Keys.messageId.S,
        },
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

class InserPayload extends Payload {
  create(): PayloadResponse {
    try {
      const { channelId, text, createdAt, messageId, user, userId } =
        this.record.dynamodb.NewImage;

      const message: Message = {
        channelId: channelId.S,
        text: text.S,
        createdAt: createdAt.S,
        user: {
          sub: user.M.sub.S,
          email_verified: user.M.email_verified.BOOL,
          updated_at: user.M.updated_at.S,
          nickname: user.M.nickname.S,
          name: user.M.name.S,
          picture: user.M.picture.S,
          email: user.M.email.S,
        },
        messageId: messageId.S,
        userId: userId.S,
      };

      return {
        eventName: 'INSERT',
        payload: message,
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export const payloadFactory = (record: DynamoDBRecord) => {
  try {
    logger.info(`Creating a payload`);

    if (record.eventName === 'INSERT') {
      return new InserPayload(record);
    }

    if (record.eventName === 'REMOVE') {
      return new RemovePayload(record);
    }
  } catch (e) {
    logger.error(`Fail to create a payload`, { error: e });
  }

  throw new Error('record is invalid');
};
