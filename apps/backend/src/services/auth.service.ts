import * as grpc from '@grpc/grpc-js';
import { type AuthServiceServer } from '../../../../packages/generated/auth';

export const authHandler: AuthServiceServer = {
	login: (call, callback) => {
		const { email, password } = call.request;

		if (email === 'test@test.com' && password === 'password123') {
			callback(null, {
				token: 'valid-jwt-token',
				userId: '123',
				email,
				name: 'John Doe',
			});
			return;
		}

		callback({
			code: grpc.status.UNAUTHENTICATED,
			message: 'Invalid email or password',
		});
	},
	register: (call, callback) => {
		callback(null, {
			token: 'new-token',
			userId: '456',
			email: call.request.email,
			name: call.request.name,
		});
	},
};
