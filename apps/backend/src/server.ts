import * as grpc from '@grpc/grpc-js';
import { AuthGrpcService, TaskGrpcService } from './grpc/contracts';
import { authHandler, taskHandler } from './services';

function main() {
  const server = new grpc.Server();

  server.addService(AuthGrpcService, authHandler);
  server.addService(TaskGrpcService, taskHandler);

  const addr = '0.0.0.0:50051';
  server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`gRPC server running at ${addr}`);
  });
}

main();