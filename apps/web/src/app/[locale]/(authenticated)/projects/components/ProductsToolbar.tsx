"use client";

import { useTranslations } from "next-intl";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import type { ProductStatus } from "../projects.types";

import styles from "../projects.module.css";

type ProductsToolbarProps = {
  onAddProduct: () => void;
  onDeleteSelected: () => void;
  query: string;
  selectedCount: number;
  setQuery: (value: string) => void;
  setStatusFilter: (value: ProductStatus | "all") => void;
  statusFilter: ProductStatus | "all";
};

export function ProductsToolbar({
  onAddProduct,
  onDeleteSelected,
  query,
  selectedCount,
  setQuery,
  setStatusFilter,
  statusFilter,
}: ProductsToolbarProps) {
  const t = useTranslations("pages.projects");

  return (
    <div className={styles.toolbar}>
      <TextField
        className={styles.searchField}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("toolbar.searchPlaceholder")}
        size="small"
        value={query}
      />

      <div className={styles.toolbarActions}>
        <FormControl size="small">
          <Select
            aria-label={t("toolbar.filterByStatusAria")}
            displayEmpty
            onChange={(event) => setStatusFilter(event.target.value as ProductStatus | "all")}
            value={statusFilter}
          >
            <MenuItem value="all">{t("statusFilter.all")}</MenuItem>
            <MenuItem value="active">{t("statusFilter.active")}</MenuItem>
            <MenuItem value="draft">{t("statusFilter.draft")}</MenuItem>
            <MenuItem value="archived">{t("statusFilter.archived")}</MenuItem>
          </Select>
        </FormControl>

        <Button
          color="error"
          disabled={selectedCount === 0}
          onClick={onDeleteSelected}
          variant="outlined"
        >
          {t("toolbar.deleteSelected", { count: selectedCount })}
        </Button>

        <Button onClick={onAddProduct} startIcon={<AddOutlinedIcon />} variant="contained">
          {t("toolbar.addProduct")}
        </Button>
      </div>
    </div>
  );
}
