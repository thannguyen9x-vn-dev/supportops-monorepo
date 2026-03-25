import { useCallback, useEffect, useState } from "react";

import type { Asset, ServiceRequest } from "@supportops/types";

import { assetService } from "@/features/service-ops/assets/services/asset.service";
import { requestService } from "@/features/service-ops/requests/services/request.service";

export type CommandPaletteTab = "requests" | "assets";

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTabState] = useState<CommandPaletteTab>("requests");
  const [query, setQuery] = useState("");
  const [requestResults, setRequestResults] = useState<ServiceRequest[]>([]);
  const [assetResults, setAssetResults] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    let cancelled = false;

    const timer = setTimeout(() => {
      if (!trimmed) {
        setRequestResults([]);
        setAssetResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const fetch =
        activeTab === "assets"
          ? assetService.list({ search: trimmed, size: 8 }).then(({ data }) => {
              if (cancelled) return;
              setAssetResults(data);
            })
          : requestService.list({ search: trimmed, size: 8 }).then(({ data }) => {
              if (cancelled) return;
              setRequestResults(data);
            });

      void fetch
        .catch(() => {
          if (cancelled) return;
          if (activeTab === "assets") setAssetResults([]);
          else setRequestResults([]);
        })
        .finally(() => {
          if (cancelled) return;
          setIsLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen, activeTab]);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setRequestResults([]);
    setAssetResults([]);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setRequestResults([]);
    setAssetResults([]);
  }, []);

  const setActiveTab = useCallback((tab: CommandPaletteTab) => {
    setActiveTabState(tab);
    setRequestResults([]);
    setAssetResults([]);
  }, []);

  return {
    isOpen,
    open,
    close,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    requestResults,
    assetResults,
    isLoading,
  };
}
