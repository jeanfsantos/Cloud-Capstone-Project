import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'channel/{channelId}/messages',
      },
    },
  ],
  tracing: true,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:Query'],
      Resource: {
        'Fn::GetAtt': ['MessagesDynamoDBTable', 'Arn'],
      },
    },
  ],
};
