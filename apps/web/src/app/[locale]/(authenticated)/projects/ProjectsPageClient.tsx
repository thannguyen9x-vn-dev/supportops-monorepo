"use client";

import type { PageMeta, Product as ContractProduct, UpdateProductRequest } from "@supportops/contracts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, MenuItem, Select, Stack, TextField } from "@mui/material";

import { useToast } from "@/features/common/toast/useToast";
import { productService } from "@/features/products/services/product.service";
import { ProductDataTable } from "@/features/products/tables";

import { DeleteProductsDialog } from "./components/DeleteProductsDialog";
import { ProductDialog } from "./components/ProductDialog";
import { mapContractProductToProject, mapDraftToCreateRequest, mapDraftToUpdateRequest } from "./projects.mapper";
import type { Product, ProductDraft, ProductStatus } from "./projects.types";
import styles from "./projects.module.css";

interface ProjectsPageClientProps {
  initialData: ContractProduct[];
  initialMeta: PageMeta;
  initialSearch: string;
  initialCategory: string;
}

export function ProjectsPageClient({ initialData, initialMeta, initialSearch, initialCategory }: ProjectsPageClientProps) {
  const t = useTranslations("pages.projects");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">(
    initialCategory === "active" || initialCategory === "draft" || initialCategory === "archived"
      ? initialCategory
      : "all"
  );

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const pushParams = (patch: Record<string, string | undefined>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(patch).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (!patch.page) {
        params.set("page", "1");
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  const handlePageChange = (page: number) => {
    pushParams({ page: String(page) });
  };

  const handleSaveProduct = async (draft: ProductDraft) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, mapDraftToUpdateRequest(draft));
        toast.success(t("state.updated"));
      } else {
        await productService.create(mapDraftToCreateRequest(draft));
        toast.success(t("state.created"));
      }

      setEditingProduct(null);
      setIsCreateOpen(false);
      router.refresh();
    } catch {
      toast.error(t("state.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (deleteIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    try {
      if (deleteIds.length === 1) {
        const targetId = deleteIds[0];
        if (targetId) {
          await productService.delete(targetId);
        }
      } else {
        await productService.bulkDelete(deleteIds);
      }

      toast.success(t("state.deleted", { count: deleteIds.length }));
      setDeleteIds([]);
      router.refresh();
    } catch {
      toast.error(t("state.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const buildInlineUpdatePayload = (changes: Partial<ContractProduct>): UpdateProductRequest => {
    const payload: UpdateProductRequest = {};

    if (typeof changes.name === "string") {
      payload.name = changes.name;
    }
    if (typeof changes.category === "string") {
      payload.category = changes.category;
    }
    if (typeof changes.brand === "string") {
      payload.brand = changes.brand;
    }
    if (typeof changes.price === "number") {
      payload.price = changes.price;
    }
    if (typeof changes.subtitle === "string") {
      payload.subtitle = changes.subtitle;
    }
    if (typeof changes.details === "string") {
      payload.details = changes.details;
    }

    return payload;
  };

  const handleInlineSaveRow = async (rowId: string, changes: Partial<ContractProduct>) => {
    const payload = buildInlineUpdatePayload(changes);

    if (Object.keys(payload).length === 0) {
      return;
    }

    await productService.update(rowId, payload);
  };

  const handleInlineSaveAll = async (changesByRow: Record<string, Partial<ContractProduct>>) => {
    const entries = Object.entries(changesByRow);
    const failedRowIds: string[] = [];
    let savedCount = 0;

    await Promise.all(
      entries.map(async ([rowId, changes]) => {
        try {
          await handleInlineSaveRow(rowId, changes);
          savedCount += 1;
        } catch {
          failedRowIds.push(rowId);
        }
      })
    );

    const failedCount = failedRowIds.length;

    if (failedCount === 0) {
      toast.success(t("state.saveAllSummarySuccess", { successCount: savedCount }));
      router.refresh();
    } else if (savedCount > 0) {
      toast.warning(
        t("state.saveAllSummaryPartial", {
          successCount: savedCount,
          failedCount
        }),
        { autoHideDuration: 4500 }
      );
    } else {
      toast.error(t("state.saveAllSummaryFailed", { failedCount }), { autoHideDuration: 4500 });
    }

    return { failedRowIds };
  };

  return (
    <div className={styles.page}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                pushParams({ search: searchValue || undefined });
              }
            }}
            placeholder={t("toolbar.searchPlaceholder")}
            size="small"
            value={searchValue}
          />

          <Select
            onChange={(event) => {
              const next = event.target.value as ProductStatus | "all";
              setStatusFilter(next);
              pushParams({ category: next === "all" ? undefined : next });
            }}
            size="small"
            value={statusFilter}
          >
            <MenuItem value="all">{t("statusFilter.all")}</MenuItem>
            <MenuItem value="active">{t("statusFilter.active")}</MenuItem>
            <MenuItem value="draft">{t("statusFilter.draft")}</MenuItem>
            <MenuItem value="archived">{t("statusFilter.archived")}</MenuItem>
          </Select>

          <Button
            onClick={() => pushParams({ search: searchValue || undefined })}
            size="small"
            variant="outlined"
          >
            {t("toolbar.search")}
          </Button>
        </Stack>

        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsCreateOpen(true);
          }}
          size="small"
          variant="contained"
        >
          {t("toolbar.addProduct")}
        </Button>
      </Stack>

      <ProductDataTable
        data={initialData}
        isLoading={isPending}
        meta={initialMeta}
        onBulkDelete={(ids) => setDeleteIds(ids)}
        onEdit={(product) => setEditingProduct(mapContractProductToProject(product))}
        onPageChange={handlePageChange}
        onSaveAll={handleInlineSaveAll}
        onSaveRow={async (rowId, changes) => {
          try {
            await handleInlineSaveRow(rowId, changes);
            toast.success(t("state.updated"));
            router.refresh();
          } catch {
            toast.error(t("state.saveError"));
            throw new Error("Inline save failed");
          }
        }}
      />

      <ProductDialog
        initialProduct={editingProduct}
        isSaving={isSaving}
        onClose={() => {
          setEditingProduct(null);
          setIsCreateOpen(false);
        }}
        onSubmit={handleSaveProduct}
        open={editingProduct !== null || isCreateOpen}
      />

      <DeleteProductsDialog
        isDeleting={isDeleting}
        onClose={() => setDeleteIds([])}
        onConfirm={handleDeleteSelected}
        open={deleteIds.length > 0}
        selectedCount={deleteIds.length}
      />
    </div>
  );
}
