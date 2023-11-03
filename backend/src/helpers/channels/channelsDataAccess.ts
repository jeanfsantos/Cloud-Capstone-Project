import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { captureAWSv3Client } from 'aws-xray-sdk-core';

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

  // https://stackoverflow.com/questions/61800675/get-all-items-from-a-table-without-scan
  async getChannels(): Promise<Channel[]> {
    try {
      logger.info('Getting channels');

      const queryParams: ScanCommandInput = {
        TableName: this.channelsTable,
      };

      const command = new ScanCommand(queryParams);

      const result = await this.docClient.send(command);

      return result.Items as Channel[];
    } catch (e) {
      logger.error('Fail to get channels', { error: e });
      throw e;
    }
  }

  async getChannelByUserId(userId: string) {
    try {
      logger.info(`Getting channels by user ${userId}`);

      const params: QueryCommandInput = {
        TableName: this.channelsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false,
      };

      const command = new QueryCommand(params);

      const result = await this.docClient.send(command);

      if (!result.Items) {
        return [];
      }

      return result.Items as Channel[];
    } catch (e) {
      logger.error(`Fail to get channel by id`, { error: e });
      throw e;
    }
  }

  async getChannelByUserAndId(
    userId: string,
    channelId: string,
  ): Promise<Channel> {
    try {
      logger.info(`Getting channel ${channelId} and user ${userId}`);

      const params: GetCommandInput = {
        TableName: this.channelsTable,
        Key: {
          userId,
          channelId,
        },
      };

      const command = new GetCommand(params);

      const result = await this.docClient.send(command);

      if (!result.Item) {
        throw new Error('Channel not found');
      }

      return result.Item as Channel;
    } catch (e) {
      logger.error(`Fail to get channel by id`, { error: e });
      throw e;
    }
  }

  async updateAttachmentUrl(
    userId: string,
    channelId: string,
    attachmentUrl: string,
  ): Promise<void> {
    try {
      logger.info(
        `Updating attachment url for ${userId} and ${channelId} with url ${attachmentUrl}`,
      );

      const params: UpdateCommandInput = {
        TableName: this.channelsTable,
        Key: {
          userId,
          channelId,
        },
        ExpressionAttributeNames: {
          '#channel_attachmentUrl': 'attachmentUrl',
        },
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
        },
        UpdateExpression: 'SET #channel_attachmentUrl = :attachmentUrl',
        ReturnValues: 'ALL_NEW',
      };

      const command = new UpdateCommand(params);

      const result = await this.docClient.send(command);

      logger.info(`Result of update statement`, { result: result });
    } catch (e) {
      logger.error('Fail to updateAttachment', { error: e });
      throw e;
    }
  }
}

function createDynamoDBClient(): DynamoDBDocumentClient {
  const client = captureAWSv3Client(new DynamoDBClient(dynamodbClientOptions));

  return client;
}
