const appId = 'eqyg9fonra';
const socketId = 'ze9wsikqrh';

export const config = {
  endpoint: `https://${appId}.execute-api.us-east-1.amazonaws.com/dev`,
  socketUrl: `wss://${socketId}.execute-api.us-east-1.amazonaws.com/dev`,
};

// Auth0
export const authConfig = {
  domain: 'dev-fqiz0hf1no3st0ac.us.auth0.com',
  clientId: 'AmXxNbjkY6eElvib52r3dBJDiRJl75Vw',
  callbackUrl: 'http://localhost:3000/callback',
  audience: 'CloudCapstoneProjectAPI',
};
