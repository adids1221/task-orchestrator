import { type TaskServiceServer } from '../../../../packages/generated/task';

export const taskHandler: TaskServiceServer = {
	createTask: (call, callback) => {
		callback(null, {
			id: 'task-1',
			projectId: call.request.projectId,
			title: call.request.title,
			description: call.request.description,
			status: 'TODO',
			assigneeId: '',
			creatorId: '123',
			taskNumber: 'TASK-101',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
	},
	updateTaskStatus: (call, callback) => {
		callback(null, {
			id: call.request.taskId,
			projectId: '',
			title: '',
			description: '',
			status: call.request.newStatus,
			assigneeId: '',
			creatorId: '',
			taskNumber: '',
			createdAt: '',
			updatedAt: '',
		});
	},
	listTasks: (_call, callback) => {
		callback(null, { tasks: [] });
	},
	deleteTask: (_call, callback) => {
		callback(null, {});
	},
	getTaskHistory: (_call, callback) => {
		callback(null, { entries: [] });
	},
};
