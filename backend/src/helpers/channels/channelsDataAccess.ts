import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { captureAWSv3Client } from 'aws-xray-sdk-core';

import { dynamodbClientOptions } from '@config/dynamodbClientOptions';
import { Channel } from '@models/Channel';
import { User } from '@models/User';
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

      return result.Items.map(item => {
        const { id, name, user } = item;
        const _user: User = {
          sub: user.M.sub.S,
          email_verified: user.M.email_verified.BOOL,
          updated_at: user.M.updated_at.S,
          nickname: user.M.nickname.S,
          name: user.M.name.S,
          picture: user.M.picture.S,
          email: user.M.email.S,
        };

        return {
          id: id.S,
          name: name.S,
          user: _user,
        };
      });
    } catch (e) {
      logger.error('Fail to get channels', { error: e });
      throw e;
    }
  }
}

function createDynamoDBClient(): DynamoDBDocumentClient {
  const client = captureAWSv3Client(new DynamoDBClient(dynamodbClientOptions));

  return client;
}
