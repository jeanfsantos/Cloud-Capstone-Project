import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'channels',
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
      Action: ['dynamodb:Scan'],
      Resource: {
        'Fn::GetAtt': ['ChannelsDynamoDBTable', 'Arn'],
      },
    },
  ],
};
