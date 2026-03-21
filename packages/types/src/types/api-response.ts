export interface PageMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PageMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PageMeta;
}
