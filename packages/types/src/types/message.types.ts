export interface MessageListItem {
  id: string;
  sender: MessageSender;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
}

export interface MessageSender {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

export interface MessageDetail {
  id: string;
  sender: MessageSender;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

export interface SendMessageRequest {
  recipientId: string;
  subject: string;
  body: string;
}

export interface StorageUsage {
  usedBytes: number;
  totalBytes: number;
  usedDisplay: string;
  totalDisplay: string;
}
