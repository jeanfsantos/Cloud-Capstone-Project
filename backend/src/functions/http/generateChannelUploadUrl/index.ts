import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'channels/{channelId}/image',
        cors: true,
        authorizer: {
          name: 'auth0Authorizer',
        },
      },
    },
  ],
  tracing: true,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
      Resource: {
        'Fn::GetAtt': ['ChannelsDynamoDBTable', 'Arn'],
      },
    },
  ],
};
