export interface RequestWatcher {
  userId: string;
  userName: string;
  autoWatch: boolean;
  createdAt: string;
}

export interface WatchStatusResponse {
  requestId: string;
  userId: string;
  watching: boolean;
}
