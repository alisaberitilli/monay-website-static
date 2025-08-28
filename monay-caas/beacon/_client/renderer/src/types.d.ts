interface BaseContainerProps {
  containerClassName?: string;
  loading?: boolean;
}

interface ProgressProps {
  complete?: number;
  pending?: number;
  clamp?: number;
  total?: number;
}

interface StoreMethods {
  get: (key: string) => string | null;
  set: (key: string, value: unknown) => void;
  has: (key: string) => boolean;
}

interface DesktopApi {
  fingerprint: string | null;
  store: StoreMethods;
}
