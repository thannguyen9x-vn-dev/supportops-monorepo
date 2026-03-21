import type {
  Board,
  CreateTaskRequest,
  MoveTaskRequest,
  TaskComment,
  TaskDetail,
  UpdateTaskRequest
} from "@supportops/types";

import { ENDPOINTS, apiClient } from "@/lib/api";

export const kanbanService = {
  getBoards: () => apiClient.get<Board[]>(ENDPOINTS.BOARDS.LIST),

  getBoard: (id: string) => apiClient.get<Board>(ENDPOINTS.BOARDS.DETAIL(id)),

  createBoard: (name: string) => apiClient.post<Board>(ENDPOINTS.BOARDS.LIST, { name }),

  createColumn: (boardId: string, name: string) => apiClient.post<void>(ENDPOINTS.BOARDS.COLUMNS(boardId), { name }),

  reorderColumns: (boardId: string, columnIds: string[]) =>
    apiClient.put<void>(ENDPOINTS.BOARDS.COLUMNS_REORDER(boardId), { columnIds }),

  deleteColumn: (boardId: string, columnId: string) => apiClient.delete<void>(ENDPOINTS.BOARDS.COLUMN(boardId, columnId)),

  createTask: (boardId: string, columnId: string, data: CreateTaskRequest) =>
    apiClient.post<void>(ENDPOINTS.BOARDS.TASKS(boardId, columnId), data),

  getTaskDetail: (taskId: string) => apiClient.get<TaskDetail>(ENDPOINTS.TASKS.DETAIL(taskId)),

  updateTask: (taskId: string, data: UpdateTaskRequest) => apiClient.put<void>(ENDPOINTS.TASKS.DETAIL(taskId), data),

  moveTask: (taskId: string, data: MoveTaskRequest) => apiClient.put<void>(ENDPOINTS.TASKS.MOVE(taskId), data),

  archiveTask: (taskId: string) => apiClient.put<void>(ENDPOINTS.TASKS.ARCHIVE(taskId)),

  deleteTask: (taskId: string) => apiClient.delete<void>(ENDPOINTS.TASKS.DETAIL(taskId)),

  addMember: (taskId: string, userId: string) => apiClient.post<void>(ENDPOINTS.TASKS.MEMBERS(taskId), { userId }),

  removeMember: (taskId: string, userId: string) => apiClient.delete<void>(ENDPOINTS.TASKS.MEMBER(taskId, userId)),

  getComments: (taskId: string) => apiClient.get<TaskComment[]>(ENDPOINTS.TASKS.COMMENTS(taskId)),

  addComment: (taskId: string, content: string) => apiClient.post<void>(ENDPOINTS.TASKS.COMMENTS(taskId), { content }),

  deleteComment: (taskId: string, commentId: string) =>
    apiClient.delete<void>(ENDPOINTS.TASKS.COMMENT(taskId, commentId)),

  uploadAttachment: (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<void>(ENDPOINTS.TASKS.ATTACHMENTS(taskId), formData);
  }
};
