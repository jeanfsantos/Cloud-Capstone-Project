let dynamodbClientOptions = {};

if (process.env.IS_OFFLINE === 'true') {
  dynamodbClientOptions = {
    region: 'localhost',
    endpoint: 'http://0.0.0.0:8000',
  };
}

export { dynamodbClientOptions };
