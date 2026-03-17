export type LoadState = "loading" | "ready" | "error" | "empty";

export type ProductStatus = "active" | "draft" | "archived";

export type Product = {
  id: string;
  displayId: string;
  name: string;
  technology: string;
  price: number;
  status: ProductStatus;
  updatedAt: string;
};

export type ProductDraft = {
  name: string;
  technology: string;
  price: number;
  status: ProductStatus;
};
