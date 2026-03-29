import { Notification, Prisma } from '@prisma/client';

export interface NotificationMetadata {
  requestCode?: string;
  actorName?: string;
}

export class NotificationResponseDto {
  id!: string;
  type!: string;
  title!: string;
  body!: string;
  requestId!: string | null;
  requestCode!: string | null;
  actorId!: string | null;
  actorName!: string | null;
  isRead!: boolean;
  readAt!: string | null;
  createdAt!: string;

  static from(model: Notification): NotificationResponseDto {
    const metadata = this.readMetadata(model.metadata);
    return {
      id: model.id,
      type: model.type,
      title: model.title,
      body: model.body,
      requestId: model.requestId,
      requestCode: metadata?.requestCode ?? null,
      actorId: model.actorId,
      actorName: metadata?.actorName ?? null,
      isRead: model.isRead,
      readAt: model.readAt?.toISOString() ?? null,
      createdAt: model.createdAt.toISOString(),
    };
  }

  private static readMetadata(value: Prisma.JsonValue | null): NotificationMetadata | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as NotificationMetadata;
  }
}
