import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { captureAWSv3Client } from 'aws-xray-sdk-core';

import { dynamodbClientOptions } from '@config/dynamodbClientOptions';
import { Message } from '@models/Message';
import { createLogger } from '@utils/logger';

const logger = createLogger('MessagesDataAccess');

export class MessagesDataAccess {
  constructor(
    private readonly docClient = createDynamoDBClient(),
    private readonly messagesTable = process.env.MESSAGES_TABLE,
  ) {}

  async createMessage(message: Message): Promise<Message> {
    try {
      logger.info('Creating new message');

      const command = new PutCommand({
        TableName: this.messagesTable,
        Item: message,
      });

      await this.docClient.send(command);

      logger.info('Created new message');

      return message;
    } catch (e) {
      logger.error('Fail to create new message', { error: e });
      throw e;
    }
  }
}

function createDynamoDBClient(): DynamoDBDocumentClient {
  const client = captureAWSv3Client(new DynamoDBClient(dynamodbClientOptions));

  return client;
}