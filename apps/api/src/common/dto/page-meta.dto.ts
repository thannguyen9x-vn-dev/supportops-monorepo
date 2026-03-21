export interface PageMetaInput {
  page: number;
  size: number;
  total: number;
}

export interface PageMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export const pageMetaOf = (input: PageMetaInput): PageMeta => ({
  page: input.page,
  size: input.size,
  total: input.total,
  totalPages: Math.ceil(input.total / input.size),
});
