export interface SkeletonRepeatOptions {
  count: number;
  keyPrefix?: string;
}

export interface UseSkeletonReturn {
  items: string[];
  containerProps: {
    "aria-busy": true;
    "aria-label": string;
    role: "status";
  };
}
