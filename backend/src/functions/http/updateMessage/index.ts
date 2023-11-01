import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'patch',
        path: 'messages/{messageId}',
        cors: true,
        authorizer: {
          name: 'auth0Authorizer',
        },
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
  tracing: true,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:UpdateItem', 'dynamodb:GetItem'],
      Resource: {
        'Fn::GetAtt': ['MessagesDynamoDBTable', 'Arn'],
      },
    },
  ],
};
