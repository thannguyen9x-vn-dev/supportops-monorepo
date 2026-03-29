import { NotificationEventType } from "../enums/notification.enums";

export interface NotificationItem {
  id: string;
  type: NotificationEventType;
  title: string;
  body: string;
  requestId: string | null;
  requestCode: string | null;
  actorId: string | null;
  actorName: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPreferenceItem {
  eventType: NotificationEventType;
  inApp: boolean;
  email: boolean;
}

export interface NotificationUnreadCount {
  count: number;
}

export interface ListNotificationsQuery {
  page?: number;
  size?: number;
  unread?: boolean;
}
