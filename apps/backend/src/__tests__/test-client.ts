import * as grpc from '@grpc/grpc-js';
import { AuthServiceClient } from '../../../../packages/generated/auth';

const client = new AuthServiceClient('localhost:50051', grpc.credentials.createInsecure());

console.log('--- Testing Login ---');

client.login({ email: 'test@test.com', password: 'password123' }, (err, response) => {
  if (err) {
    console.error('Login failed:', err.message);
    return;
  }

  console.log('Login success! User:', response.name);
  console.log('Token:', response.token);
});

setTimeout(() => {
  console.log('\n--- Testing Invalid Login ---');

  client.login({ email: 'wrong@test.com', password: 'bad' }, (err) => {
    if (err) {
      console.log('Expected error:', err.message);
      return;
    }

    console.log('Unexpected success');
  });
}, 1000);
