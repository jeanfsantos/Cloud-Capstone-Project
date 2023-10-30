import 'dotenv/config';

import type { AWS } from '@serverless/typescript';

// http
import hello from '@functions/http/hello';
import createChannel from '@functions/http/createChannel';
import getChannels from '@functions/http/getChannels';
import createMessage from '@functions/http/createMessage';
import getMessagesByChannel from '@functions/http/getMessagesByChannel';

// websocket
import connectHandler from '@functions/websocket/connectHandler';
import disconnectHandler from '@functions/websocket/disconnectHandler';

// dynamoDB
import sendMessage from '@functions/dynamoDB/sendMessage';

const region = process.env.REGION ?? 'us-east-1';
const stage = process.env.STAGE ?? 'dev';
const channelsTable = `Channels-${stage}`;
const messagesTable = `Messages-${stage}`;
const connectionsTable = `Connections-${stage}`;

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
      CONNECTIONS_TABLE: connectionsTable,
      API_GATEWAY_URL: {
        'Fn::Join': [
          '',
          [
            'https://',
            {
              Ref: 'WebsocketsApi',
            },
            '.execute-api.${self:custom.region}.amazonaws.com/${self:custom.stage}',
          ],
        ],
      },
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
  functions: {
    hello,
    createChannel,
    getChannels,
    createMessage,
    connectHandler,
    disconnectHandler,
    sendMessage,
    getMessagesByChannel,
  },
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
    stage: stage,
    region: region,
  },
  resources: {
    Resources: {
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers':
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'gatewayresponse.header.Access-Control-Allow-Methods':
              "'GET,OPTIONS,POST'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
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
          StreamSpecification: {
            StreamViewType: 'NEW_IMAGE',
          },
        },
      },
      ConnectionsDynamoDBTable: {
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
          TableName: connectionsTable,
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
