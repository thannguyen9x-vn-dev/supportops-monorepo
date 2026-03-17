import type { PageMeta, Product } from "@supportops/contracts";

import { productServerService } from "@/features/products/services/product.server";

import { ProjectsPageClient } from "./ProjectsPageClient";

export const dynamic = "force-dynamic";

type ProjectsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
};

function buildFallbackMeta(data: Product[], page: number, size: number): PageMeta {
  return {
    page,
    size,
    total: data.length,
    totalPages: Math.max(1, Math.ceil(data.length / size))
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;

  const page = Number(params.page) > 0 ? Number(params.page) : 1;
  const size = 8;
  const search = params.search || "";
  const category = params.category || "";

  const response = await productServerService.list({ page, size, search, category });

  return (
    <ProjectsPageClient
      initialCategory={category}
      initialData={response.data}
      initialMeta={response.meta ?? buildFallbackMeta(response.data, page, size)}
      initialSearch={search}
    />
  );
}
