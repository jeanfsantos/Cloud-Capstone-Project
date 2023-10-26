import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      websocket: {
        route: '$disconnect',
      },
    },
  ],
  tracing: true,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:DeleteItem'],
      Resource: {
        'Fn::GetAtt': ['ConnectionsDynamoDBTable', 'Arn'],
      },
    },
  ],
};
