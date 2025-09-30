import React, { memo, useMemo, useCallback } from 'react';
import { isEqual } from 'lodash';

// Deep comparison memo for complex props
export const deepMemo = <P extends object>(
  component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(component, propsAreEqual || isEqual);
};

// Optimized Transaction Row Component
export const TransactionRow = memo(({ transaction, onSelect, isSelected }: any) => {
  const handleClick = useCallback(() => {
    onSelect?.(transaction.id);
  }, [transaction.id, onSelect]);

  return (
    <div
      className={`transaction-row ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <span>{transaction.date}</span>
      <span>{transaction.description}</span>
      <span>${transaction.amount.toFixed(2)}</span>
      <span className={`status-${transaction.status}`}>{transaction.status}</span>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.transaction.id === nextProps.transaction.id &&
         prevProps.isSelected === nextProps.isSelected;
});

// Optimized Wallet Card Component
export const WalletCard = memo(({ wallet, onClick }: any) => {
  const formattedBalance = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency || 'USD'
    }).format(wallet.balance);
  }, [wallet.balance, wallet.currency]);

  const percentageChange = useMemo(() => {
    if (!wallet.previousBalance || wallet.previousBalance === 0) return 0;
    return ((wallet.balance - wallet.previousBalance) / wallet.previousBalance * 100).toFixed(2);
  }, [wallet.balance, wallet.previousBalance]);

  return (
    <div className="wallet-card" onClick={() => onClick?.(wallet.id)}>
      <h3>{wallet.name}</h3>
      <p className="balance">{formattedBalance}</p>
      <p className={`change ${Number(percentageChange) >= 0 ? 'positive' : 'negative'}`}>
        {Number(percentageChange) >= 0 ? '+' : ''}{percentageChange}%
      </p>
      <div className="wallet-meta">
        <span>{wallet.type}</span>
        <span>{wallet.network}</span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.wallet.id === nextProps.wallet.id &&
         prevProps.wallet.balance === nextProps.wallet.balance;
});

// Optimized Chart Component
export const OptimizedChart = memo(({ data, type, options }: any) => {
  const chartData = useMemo(() => {
    // Process and format chart data
    return data?.map((item: any) => ({
      ...item,
      value: parseFloat(item.value),
      label: item.label || item.name,
    })) || [];
  }, [data]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      ...options,
    };
  }, [options]);

  return (
    <div className="optimized-chart">
      {/* Chart rendering logic here */}
      <div data-chart-type={type} data-chart-data={JSON.stringify(chartData)}>
        {/* Placeholder for actual chart component */}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
         prevProps.type === nextProps.type;
});

// Optimized Compliance Status Component
export const ComplianceStatus = memo(({ status, details }: any) => {
  const statusColor = useMemo(() => {
    switch (status) {
      case 'compliant': return 'green';
      case 'pending': return 'yellow';
      case 'non-compliant': return 'red';
      default: return 'gray';
    }
  }, [status]);

  const statusIcon = useMemo(() => {
    switch (status) {
      case 'compliant': return '✓';
      case 'pending': return '⏱';
      case 'non-compliant': return '✗';
      default: return '?';
    }
  }, [status]);

  return (
    <div className={`compliance-status status-${statusColor}`}>
      <span className="status-icon">{statusIcon}</span>
      <span className="status-text">{status}</span>
      {details && <p className="status-details">{details}</p>}
    </div>
  );
});

// Optimized Data Table Component
export const DataTable = memo(({ columns, data, onRowClick, selectedRows = [] }: any) => {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // Default sort by first column
      const firstCol = columns[0]?.key;
      if (!firstCol) return 0;
      return a[firstCol] > b[firstCol] ? 1 : -1;
    });
  }, [data, columns]);

  const handleRowClick = useCallback((rowId: string) => {
    onRowClick?.(rowId);
  }, [onRowClick]);

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row: any) => (
          <tr
            key={row.id}
            onClick={() => handleRowClick(row.id)}
            className={selectedRows.includes(row.id) ? 'selected' : ''}
          >
            {columns.map((col: any) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}, (prevProps, nextProps) => {
  return prevProps.data.length === nextProps.data.length &&
         JSON.stringify(prevProps.selectedRows) === JSON.stringify(nextProps.selectedRows);
});

// Optimized Metric Card Component
export const MetricCard = memo(({ title, value, change, icon, color = 'blue' }: any) => {
  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value > 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toFixed(0);
    }
    return value;
  }, [value]);

  const changeIndicator = useMemo(() => {
    if (!change) return null;
    const isPositive = change > 0;
    return (
      <span className={`change-indicator ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change)}%
      </span>
    );
  }, [change]);

  return (
    <div className={`metric-card color-${color}`}>
      {icon && <div className="metric-icon">{icon}</div>}
      <div className="metric-content">
        <h4>{title}</h4>
        <p className="metric-value">{formattedValue}</p>
        {changeIndicator}
      </div>
    </div>
  );
});

// Optimized Form Field Component
export const FormField = memo(({
  label,
  value,
  onChange,
  type = 'text',
  error,
  required
}: any) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  }, [onChange]);

  const inputId = useMemo(() => `field-${label.toLowerCase().replace(/\s+/g, '-')}`, [label]);

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={inputId}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && <span id={`${inputId}-error`} className="error-message">{error}</span>}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value &&
         prevProps.error === nextProps.error &&
         prevProps.label === nextProps.label;
});

// Optimized Navigation Item Component
export const NavItem = memo(({ href, label, icon, isActive, onClick }: any) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.(href);
  }, [href, onClick]);

  return (
    <a
      href={href}
      className={`nav-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      {icon && <span className="nav-icon">{icon}</span>}
      <span className="nav-label">{label}</span>
    </a>
  );
}, (prevProps, nextProps) => {
  return prevProps.isActive === nextProps.isActive &&
         prevProps.href === nextProps.href;
});

// Export utility for wrapping existing components
export const withOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  propsComparator?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, propsComparator);
};

// Hook for memoized expensive computations
export const useExpensiveComputation = <T,>(
  computeFn: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(computeFn, deps);
};

// Hook for stable callbacks
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps) as T;
};