import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

import { dynamodbClientOptions } from '@config/dynamodbClientOptions';
import { Channel } from '@models/Channel';
import { createLogger } from '@utils/logger';

const logger = createLogger('ChannelsDataAccess');

export class ChannelsDataAccess {
  constructor(
    private readonly docClient = createDynamoDBClient(),
    private readonly channelsTable = process.env.CHANNELS_TABLE,
  ) {}

  async createChannel(channel: Channel): Promise<Channel> {
    try {
      logger.info('Creating new channel');

      const command = new PutCommand({
        TableName: this.channelsTable,
        Item: channel,
      });

      await this.docClient.send(command);

      logger.info('Created new channel');

      return channel;
    } catch (e) {
      logger.error('Fail to create new channel', { error: e });
      throw e;
    }
  }
}

function createDynamoDBClient(): DynamoDBDocumentClient {
  const client = new DynamoDBClient(dynamodbClientOptions);
  const docClient = DynamoDBDocumentClient.from(client);

  return docClient;

  // const service = new AWS.DynamoDB()
  // const client = new AWS.DynamoDB.DocumentClient({
  //   service: service
  // })

  // AWSXRay.captureAWSClient(service)
  // return client
}
