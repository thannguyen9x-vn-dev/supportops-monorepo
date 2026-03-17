import type { CreateProductRequest, Product as ContractProduct, ProductListItem, UpdateProductRequest } from "@supportops/contracts";

import type { Product, ProductDraft, ProductStatus } from "./projects.types";

function mapCategoryToStatus(category: string): ProductStatus {
  const normalized = category.trim().toLowerCase();

  if (normalized === "draft") {
    return "draft";
  }

  if (normalized === "archived") {
    return "archived";
  }

  return "active";
}

function mapStatusToCategory(status: ProductStatus): string {
  return status;
}

function normalizeDisplayId(id: string): string {
  return id.startsWith("#") ? id : `#${id}`;
}

export function mapListItemToProject(item: ProductListItem & Partial<Pick<ContractProduct, "updatedAt">>): Product {
  return {
    id: item.id,
    displayId: normalizeDisplayId(item.productId || item.id),
    name: item.name,
    technology: item.subtitle ?? item.category,
    price: item.price,
    status: mapCategoryToStatus(item.category),
    updatedAt: item.updatedAt ?? new Date().toISOString()
  };
}

export function mapContractProductToProject(product: ContractProduct): Product {
  return {
    id: product.id,
    displayId: normalizeDisplayId(product.id),
    name: product.name,
    technology: product.subtitle ?? product.brand,
    price: product.price,
    status: mapCategoryToStatus(product.category),
    updatedAt: product.updatedAt
  };
}

export function mapDraftToCreateRequest(draft: ProductDraft): CreateProductRequest {
  return {
    name: draft.name,
    subtitle: draft.technology,
    category: mapStatusToCategory(draft.status),
    brand: draft.technology,
    price: draft.price
  };
}

export function mapDraftToUpdateRequest(draft: ProductDraft): UpdateProductRequest {
  return {
    name: draft.name,
    subtitle: draft.technology,
    category: mapStatusToCategory(draft.status),
    brand: draft.technology,
    price: draft.price
  };
}
