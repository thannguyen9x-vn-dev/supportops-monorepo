export interface UseClipboardOptions {
  resetDelay?: number;
}

export interface UseClipboardReturn {
  copied: boolean;
  error: Error | null;
  copy: (text: string) => Promise<boolean>;
  read: () => Promise<string | null>;
  reset: () => void;
}
