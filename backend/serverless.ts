import 'dotenv/config';

import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';
import createChannel from '@functions/createChannel';
import getChannels from '@functions/getChannels';
import createMessage from '@functions/createMessage';

const stage = process.env.STAGE ?? 'dev';
const channelsTable = `Channels-${stage}`;
const messagesTable = `Messages-${stage}`;

const serverlessConfiguration: AWS = {
  service: 'backend',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-iam-roles-per-function',
    'serverless-plugin-tracing',
    'serverless-dynamodb',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      CHANNELS_TABLE: channelsTable,
      MESSAGES_TABLE: messagesTable,
    },
    tracing: {
      lambda: true,
      apiGateway: true,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['xray:PutTraceSegments', 'xray:PutTelemetryRecords'],
        Resource: ['*'],
      },
    ],
  },
  // import the function via paths
  functions: { hello, createChannel, getChannels, createMessage },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      ChannelsDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
          TableName: channelsTable,
        },
      },
      MessagesDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'channelId',
              AttributeType: 'S',
            },
            {
              AttributeName: 'timestamp',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'channelId',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'timestamp',
              KeyType: 'RANGE',
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
          TableName: messagesTable,
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
