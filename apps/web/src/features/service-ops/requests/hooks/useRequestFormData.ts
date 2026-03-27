import { useEffect, useMemo, useState } from "react";
import type { Asset } from "@supportops/types";

import { assetService } from "@/features/service-ops/assets/services/asset.service";
import { serviceOpsSettingsService } from "@/features/service-ops/settings/services/service-ops-settings.service";

const DEFAULT_SERVICE_TYPE_OPTIONS = [
  { label: "HVAC / Climate Control", value: "HVAC" },
  { label: "Lighting", value: "LIGHTING" },
  { label: "Water Leakage", value: "WATER" },
  { label: "Access Card", value: "ACCESS" },
];

const LOCATION_OPTIONS = [
  { label: "Headquarters - Floor 2 - Server Room B", value: "HQ-FLOOR-2-SERVER-ROOM-B" },
  { label: "Headquarters - Floor 5 - Meeting Room C", value: "HQ-FLOOR-5-MEETING-ROOM-C" },
  { label: "Branch Office - Ops Room", value: "BRANCH-OPS-ROOM" },
];

export function useRequestFormData(watchedLocation: string) {
  const [serviceTypeOptions, setServiceTypeOptions] = useState(DEFAULT_SERVICE_TYPE_OPTIONS);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadServiceTypeOptions = async () => {
      try {
        const data = await serviceOpsSettingsService.listServiceTypes();
        const options = data
          .filter((item) => item.isActive ?? true)
          .map((item) => ({ label: item.name, value: item.code }));

        if (isMounted && options.length > 0) {
          setServiceTypeOptions(options);
        }
      } catch {
        // Keep stable fallback options for intake flow.
      }
    };

    void loadServiceTypeOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadingAssets(true);

    const fetchAllAssets = async () => {
      const { data } = await assetService.list({ size: 100 });
      return data;
    };

    const loadAssets = async () => {
      try {
        const query = watchedLocation ? { locationId: watchedLocation, size: 100 } : { size: 100 };
        const { data } = await assetService.list(query);

        if (!isMounted) return;

        if (watchedLocation && data.length === 0) {
          const fallbackAssets = await fetchAllAssets();
          if (!isMounted) return;
          setAssets(fallbackAssets);
          return;
        }

        setAssets(data);
      } catch {
        // Fallback to global asset list in case location-filter query fails.
        try {
          const fallbackAssets = await fetchAllAssets();
          if (!isMounted) return;
          setAssets(fallbackAssets);
        } catch {
          if (!isMounted) return;
          setAssets([]);
        }
      } finally {
        if (isMounted) setLoadingAssets(false);
      }
    };

    void loadAssets();

    return () => {
      isMounted = false;
    };
  }, [watchedLocation]);

  const assetOptions = useMemo(
    () =>
      assets.map((asset) => ({
        label: `${asset.name} (${asset.assetCode})`,
        value: asset.id,
      })),
    [assets],
  );

  return {
    serviceTypeOptions,
    locationOptions: LOCATION_OPTIONS,
    assetOptions,
    loadingAssets,
  };
}
