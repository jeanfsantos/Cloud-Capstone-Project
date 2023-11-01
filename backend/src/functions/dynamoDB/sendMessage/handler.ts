import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda';

import { getConnections } from '@helpers/connections/connectionsBusiness';
import { sendMessageToClient } from '@helpers/messages/messagesBusiness';
import { createLogger } from '@utils/logger';
import { payloadFactory } from './payloadFactory';

const logger = createLogger('sendMessage');

const sendMessage: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent,
) => {
  logger.info('Processing events batch from DynamoDB');

  for (const record of event.Records) {
    try {
      logger.info('Processing record', { payload: record });

      if (!['INSERT', 'REMOVE'].includes(record.eventName)) {
        return;
      }

      const payloadObject = payloadFactory(record);
      const payload = payloadObject.create();

      logger.info('Processing a message:', { payload });

      const connections = await getConnections();

      logger.info('Getted connections');

      for (const connection of connections) {
        await sendMessageToClient(connection.id, payload);
      }
    } catch (e) {
      logger.error('Fail to process record:', { error: e });
    }
  }
};

export const main = sendMessage;
