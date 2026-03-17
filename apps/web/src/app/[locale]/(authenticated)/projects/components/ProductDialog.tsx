"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Stack } from "@mui/material";
import { Dialog, Form, useTypedForm } from "@supportops/ui";

import { ProductFormFields } from "./ProductFormFields";
import type { ProductDialogFormValues } from "./ProductFormFields";
import type { Product, ProductDraft } from "../projects.types";

type ProductDialogProps = {
  initialProduct: Product | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (values: ProductDraft) => Promise<void>;
  open: boolean;
};

export function ProductDialog({
  initialProduct,
  isSaving,
  onClose,
  onSubmit,
  open,
}: ProductDialogProps) {
  const t = useTranslations("pages.projects");
  const isEdit = Boolean(initialProduct);

  const { form, handleSubmit, reset } = useTypedForm<ProductDialogFormValues>({
    schema: {
      safeParse: (input: unknown) => {
        const data = input as Partial<ProductDialogFormValues>;
        const issues: Array<{ path: Array<string | number>; code: string; message: string }> = [];

        if (!data.name || data.name.trim().length === 0) {
          issues.push({ path: ["name"], code: "custom", message: t("validation.nameRequired") });
        }

        if (!data.technology || data.technology.trim().length === 0) {
          issues.push({ path: ["technology"], code: "custom", message: t("validation.technologyRequired") });
        }

        if (typeof data.price !== "number" || Number.isNaN(data.price)) {
          issues.push({ path: ["price"], code: "custom", message: t("validation.priceRequired") });
        } else if (data.price <= 0) {
          issues.push({ path: ["price"], code: "custom", message: t("validation.pricePositive") });
        }

        if (!data.status || !["active", "draft", "archived"].includes(data.status)) {
          issues.push({ path: ["status"], code: "custom", message: t("validation.statusRequired") });
        }

        if (issues.length > 0) {
          return {
            success: false as const,
            error: { issues }
          };
        }

        return {
          success: true as const,
          data: {
            name: String(data.name).trim(),
            technology: String(data.technology).trim(),
            price: Number(data.price),
            status: data.status as ProductDialogFormValues["status"]
          }
        };
      }
    },
    defaultValues: {
      name: "",
      technology: "",
      price: undefined,
      status: "draft",
    },
    onSubmit: async (values) => {
      await onSubmit({
        name: values.name,
        technology: values.technology,
        price: values.price as number,
        status: values.status
      });
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: initialProduct?.name ?? "",
      technology: initialProduct?.technology ?? "",
      price: initialProduct?.price ?? undefined,
      status: initialProduct?.status ?? "draft",
    });
  }, [initialProduct, open, reset]);

  return (
    <Dialog
      footer={
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} variant="text">
            {t("dialog.cancel")}
          </Button>
          <Button
            disabled={isSaving}
            onClick={() => {
              void handleSubmit();
            }}
            variant="contained"
          >
            {isSaving ? t("dialog.saving") : t("dialog.save")}
          </Button>
        </Stack>
      }
      onClose={onClose}
      open={open}
      title={isEdit ? t("dialog.editTitle") : t("dialog.createTitle")}
    >
      <Form
        form={form}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <ProductFormFields form={form} t={t} />
      </Form>
    </Dialog>
  );
}
