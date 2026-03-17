"use client";

import type { UseFormReturn } from "react-hook-form";
import { Stack } from "@mui/material";
import { NumberField, SelectField, TextField } from "@supportops/ui";

import type { ProductStatus } from "../projects.types";

export type ProductDialogFormValues = {
  name: string;
  technology: string;
  price: number | undefined;
  status: ProductStatus;
};

type ProductFormFieldsProps = {
  form: UseFormReturn<ProductDialogFormValues>;
  t: (key: string) => string;
};

export function ProductFormFields({ form, t }: ProductFormFieldsProps) {
  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <TextField<ProductDialogFormValues>
        autoComplete="off"
        form={form}
        label={t("dialog.fields.name")}
        name="name"
        required
      />

      <TextField<ProductDialogFormValues>
        autoComplete="off"
        form={form}
        label={t("dialog.fields.technology")}
        name="technology"
        required
      />

      <NumberField<ProductDialogFormValues>
        form={form}
        label={t("dialog.fields.price")}
        min={1}
        name="price"
        required
        step={1}
      />

      <SelectField<ProductDialogFormValues>
        form={form}
        label={t("dialog.fields.status")}
        name="status"
        options={[
          { label: t("status.active"), value: "active" },
          { label: t("status.draft"), value: "draft" },
          { label: t("status.archived"), value: "archived" }
        ]}
      />
    </Stack>
  );
}
