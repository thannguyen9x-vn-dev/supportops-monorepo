export interface Board {
  id: string;
  name: string;
  columns: BoardColumn[];
}

export interface BoardColumn {
  id: string;
  name: string;
  sortOrder: number;
  tasks: TaskCard[];
}

export interface TaskCard {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  dueDate: string | null;
  sortOrder: number;
  assignees: TaskAssignee[];
  commentCount: number;
  attachmentCount: number;
}

export interface TaskDetail extends TaskCard {
  createdBy: TaskAssignee;
  createdAt: string;
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

export interface TaskAssignee {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role?: string;
}

export interface TaskComment {
  id: string;
  author: TaskAssignee;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: TaskAssignee;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  assigneeIds?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string | null;
  coverImageUrl?: string | null;
}

export interface MoveTaskRequest {
  columnId: string;
  sortOrder: number;
}
