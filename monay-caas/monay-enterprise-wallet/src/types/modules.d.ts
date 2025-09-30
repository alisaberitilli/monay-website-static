// Module declarations for libraries without TypeScript support

declare module '@sentry/nextjs' {
  export interface SentryConfig {
    dsn?: string;
    environment?: string;
    tracesSampleRate?: number;
    replaysSessionSampleRate?: number;
    replaysOnErrorSampleRate?: number;
    beforeSend?: (event: any) => any;
    integrations?: any[];
  }

  export function init(config: SentryConfig): void;
  export function captureException(error: Error): void;
  export function captureMessage(message: string): void;
  export function setUser(user: any): void;
  export function setContext(name: string, context: any): void;
  export function addBreadcrumb(breadcrumb: any): void;
  export const withSentryConfig: any;
  export const BrowserTracing: any;
  export const Replay: any;
}

declare module '@datadog/browser-rum' {
  export interface DatadogRumConfig {
    applicationId: string;
    clientToken: string;
    site?: string;
    service?: string;
    env?: string;
    version?: string;
    sessionSampleRate?: number;
    sessionReplaySampleRate?: number;
    trackInteractions?: boolean;
    trackResources?: boolean;
    trackLongTasks?: boolean;
    defaultPrivacyLevel?: string;
  }

  export const datadogRum: {
    init(config: DatadogRumConfig): void;
    startSessionReplayRecording(): void;
    stopSessionReplayRecording(): void;
    addAction(name: string, context?: any): void;
    addError(error: Error, context?: any): void;
    addTiming(name: string, time?: number): void;
    setUser(user: any): void;
    setUserProperty(key: string, value: any): void;
    setGlobalContextProperty(key: string, value: any): void;
    removeGlobalContextProperty(key: string): void;
    getGlobalContext(): any;
  };

  export function init(config: DatadogRumConfig): void;
  export function startSessionReplayRecording(): void;
  export function stopSessionReplayRecording(): void;
  export function addAction(name: string, context?: any): void;
  export function addError(error: Error, context?: any): void;
  export function addTiming(name: string, time?: number): void;
  export function setUser(user: any): void;
  export function setUserProperty(key: string, value: any): void;
  export function setGlobalContextProperty(key: string, value: any): void;
  export function removeGlobalContextProperty(key: string): void;
  export function getGlobalContext(): any;
}

declare module 'web-vitals' {
  export interface Metric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    entries: PerformanceEntry[];
    id: string;
    navigationType: string;
  }

  export type ReportHandler = (metric: Metric) => void;

  export function getCLS(onReport: ReportHandler): void;
  export function getFID(onReport: ReportHandler): void;
  export function getFCP(onReport: ReportHandler): void;
  export function getLCP(onReport: ReportHandler): void;
  export function getTTFB(onReport: ReportHandler): void;
  export function getINP(onReport: ReportHandler): void;
}

// Extend NextRequest and NextResponse types
declare module 'next/server' {
  interface NextRequest {
    ip?: string;
    headers: Headers;
    method: string;
  }

  export class NextResponse extends Response {
    static next(init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number | ResponseInit): NextResponse;
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
    static json(object: any, init?: ResponseInit): NextResponse;
  }
}