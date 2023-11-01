import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'delete',
        path: 'messages/{messageId}',
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
      Action: ['dynamodb:DeleteItem', 'dynamodb:GetItem'],
      Resource: {
        'Fn::GetAtt': ['MessagesDynamoDBTable', 'Arn'],
      },
    },
  ],
};
