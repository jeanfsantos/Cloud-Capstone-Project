import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      stream: {
        type: 'dynamodb',
        arn: {
          'Fn::GetAtt': ['MessagesDynamoDBTable', 'StreamArn'],
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
        'Fn::GetAtt': ['ConnectionsDynamoDBTable', 'Arn'],
      },
    },
    {
      Effect: 'Allow',
      Action: ['execute-api:Invoke', 'execute-api:ManageConnections'],
      Resource: '*',
    },
  ],
};
