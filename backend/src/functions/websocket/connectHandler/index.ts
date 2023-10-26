import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      websocket: {
        route: '$connect',
      },
    },
  ],
  tracing: true,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:PutItem'],
      Resource: {
        'Fn::GetAtt': ['ConnectionsDynamoDBTable', 'Arn'],
      },
    },
  ],
};
