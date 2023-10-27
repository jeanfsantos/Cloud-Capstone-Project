import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda';

import { getConnections } from '@helpers/connections/connectionsBusiness';
import { sendMessageToClient } from '@helpers/messages/messagesBusiness';
import { Message } from '@models/Message';
import { createLogger } from '@utils/logger';

const logger = createLogger('sendMessage');

const sendMessage: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent,
) => {
  logger.info('Processing events batch from DynamoDB');

  for (const record of event.Records) {
    try {
      logger.info('Processing record', { payload: record });

      if (record.eventName !== 'INSERT') {
        continue;
      }

      const { channelId, text, timestamp } = record.dynamodb.NewImage;
      const message: Message = {
        channelId: channelId.S,
        text: text.S,
        timestamp: timestamp.S,
      };

      logger.info('Processing a message:', { payload: message });

      const connections = await getConnections();

      logger.info('Getted connections');

      for (const connection of connections) {
        await sendMessageToClient(connection.id, message);
      }
    } catch (e) {
      logger.error('Fail to process record:', { error: e });
    }
  }
};

export const main = sendMessage;
