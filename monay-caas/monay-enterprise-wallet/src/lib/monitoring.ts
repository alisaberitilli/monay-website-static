// Monitoring and Error Tracking Configuration
// Supports Sentry, DataDog, and custom analytics

interface MonitoringConfig {
  sentry?: {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
  };
  datadog?: {
    applicationId: string;
    clientToken: string;
    site: string;
  };
  customAnalytics?: {
    endpoint: string;
    apiKey: string;
  };
}

// Initialize monitoring services
export const initMonitoring = () => {
  // Sentry Configuration
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    import('@sentry/nextjs').then(Sentry => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
          new Sentry.BrowserTracing(),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        beforeSend(event) {
          // Filter sensitive data
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers;
          }
          return event;
        },
      });
    });
  }

  // DataDog RUM Configuration
  if (process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID) {
    import('@datadog/browser-rum').then(({ datadogRum }) => {
      datadogRum.init({
        applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID!,
        clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
        site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
        service: 'monay-enterprise-wallet',
        env: process.env.NODE_ENV || 'development',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        sessionSampleRate: 100,
        sessionReplaySampleRate: process.env.NODE_ENV === 'production' ? 20 : 100,
        trackInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input',
      });
    });
  }

  // Web Vitals Reporting
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  }
};

// Send metrics to analytics
const sendToAnalytics = (metric: any) => {
  // Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || '',
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      // Silently fail analytics
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', metric);
  }
};

// Error tracking wrapper
export const trackError = (error: Error, context?: Record<string, any>) => {
  console.error('[Error]', error, context);

  // Send to Sentry
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      contexts: { custom: context },
    });
  }

  // Send to DataDog
  if (typeof window !== 'undefined' && (window as any).DD_RUM) {
    (window as any).DD_RUM.addError(error, {
      ...context,
      source: 'custom',
    });
  }

  // Send to custom error tracking
  if (process.env.NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_ERROR_API_KEY || '',
      },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        context,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      // Silently fail error tracking
    });
  }
};

// Custom event tracking
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  // Send to DataDog
  if (typeof window !== 'undefined' && (window as any).DD_RUM) {
    (window as any).DD_RUM.addAction(eventName, properties);
  }

  // Send to custom analytics
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || '',
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
      }),
    }).catch(() => {
      // Silently fail event tracking
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Event]', eventName, properties);
  }
};

// User tracking
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  // Send to Sentry
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setUser({
      id: userId,
      ...traits,
    });
  }

  // Send to DataDog
  if (typeof window !== 'undefined' && (window as any).DD_RUM) {
    (window as any).DD_RUM.setUser({
      id: userId,
      ...traits,
    });
  }

  // Send to custom analytics
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || '',
      },
      body: JSON.stringify({
        userId,
        traits,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail user identification
    });
  }
};

// Performance monitoring
export const measurePerformance = (
  name: string,
  fn: () => void | Promise<void>
) => {
  const startTime = performance.now();

  const complete = () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Send performance metric
    sendToAnalytics({
      name: `custom.${name}`,
      value: duration,
      delta: duration,
      id: `${name}-${Date.now()}`,
    });

    // Log slow operations
    if (duration > 1000) {
      console.warn(`[Performance] Slow operation: ${name} took ${duration}ms`);
    }
  };

  const result = fn();

  if (result instanceof Promise) {
    return result.finally(complete);
  } else {
    complete();
    return result;
  }
};

// API monitoring wrapper
export const monitorApi = async (
  url: string,
  options: RequestInit,
  context?: Record<string, any>
) => {
  const startTime = performance.now();

  try {
    const response = await fetch(url, options);
    const duration = performance.now() - startTime;

    // Track API performance
    trackEvent('api_request', {
      url,
      method: options.method || 'GET',
      status: response.status,
      duration,
      ...context,
    });

    // Alert on slow APIs
    if (duration > 3000) {
      trackError(new Error(`Slow API: ${url} took ${duration}ms`), {
        url,
        duration,
        ...context,
      });
    }

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;

    // Track API error
    trackError(error as Error, {
      url,
      method: options.method || 'GET',
      duration,
      ...context,
    });

    throw error;
  }
};

// Session recording
export const startSessionRecording = () => {
  if (typeof window !== 'undefined') {
    // Start Sentry session replay
    if ((window as any).Sentry?.getCurrentHub) {
      const client = (window as any).Sentry.getCurrentHub().getClient();
      const replay = client?.getIntegration('Replay');
      if (replay) {
        replay.start();
      }
    }

    // DataDog session replay is automatic
  }
};

export const stopSessionRecording = () => {
  if (typeof window !== 'undefined') {
    // Stop Sentry session replay
    if ((window as any).Sentry?.getCurrentHub) {
      const client = (window as any).Sentry.getCurrentHub().getClient();
      const replay = client?.getIntegration('Replay');
      if (replay) {
        replay.stop();
      }
    }
  }
};

// Export monitoring instance
export default {
  init: initMonitoring,
  trackError,
  trackEvent,
  identifyUser,
  measurePerformance,
  monitorApi,
  startSessionRecording,
  stopSessionRecording,
};