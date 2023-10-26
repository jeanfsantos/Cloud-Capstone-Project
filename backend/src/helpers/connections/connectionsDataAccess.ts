import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { captureAWSv3Client } from 'aws-xray-sdk-core';

import { dynamodbClientOptions } from '@config/dynamodbClientOptions';
import { Connection } from '@models/Connection';
import { createLogger } from '@utils/logger';

const logger = createLogger('ConnectionsDataAccess');

export class ConnectionsDataAccess {
  constructor(
    private readonly docClient = createDynamoDBClient(),
    private readonly connectionsTable = process.env.CONNECTIONS_TABLE,
  ) {}

  async createConnection(connection: Connection): Promise<void> {
    try {
      logger.info('Creating new connection');

      const command = new PutCommand({
        TableName: this.connectionsTable,
        Item: connection,
      });

      await this.docClient.send(command);

      logger.info('Created new connection');
    } catch (e) {
      logger.error('Fail to create new connection', { error: e });
      throw e;
    }
  }

  async deleteConnection(connectionId: string): Promise<void> {
    try {
      logger.info('Deleting a connection');

      const command = new DeleteCommand({
        TableName: this.connectionsTable,
        Key: {
          id: connectionId,
        },
      });

      await this.docClient.send(command);

      logger.info('Deleted a connection');
    } catch (e) {
      logger.error('Fail to delete a connection');
      throw e;
    }
  }
}

function createDynamoDBClient(): DynamoDBDocumentClient {
  const client = captureAWSv3Client(new DynamoDBClient(dynamodbClientOptions));

  return client;
}
