import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  scrollToIndex?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  emptyMessage?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 3,
  scrollToIndex,
  onScroll,
  className = '',
  emptyMessage = 'No items to display'
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate item heights and positions
  const itemHeights = useMemo(() => {
    if (typeof itemHeight === 'number') {
      return Array(items.length).fill(itemHeight);
    }
    return items.map((_, index) => itemHeight(index));
  }, [items, itemHeight]);

  const itemPositions = useMemo(() => {
    const positions: number[] = [];
    let total = 0;
    itemHeights.forEach((height) => {
      positions.push(total);
      total += height;
    });
    return positions;
  }, [itemHeights]);

  const totalHeight = useMemo(() => {
    return itemPositions[itemPositions.length - 1] +
           (itemHeights[itemHeights.length - 1] || 0);
  }, [itemPositions, itemHeights]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(
      0,
      itemPositions.findIndex((pos) => pos >= scrollTop) - overscan
    );

    const end = Math.min(
      items.length,
      itemPositions.findIndex((pos) => pos > scrollTop + height) + overscan
    );

    return { start, end: end === -1 ? items.length : end };
  }, [scrollTop, height, itemPositions, items.length, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to index
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex >= 0 && scrollToIndex < items.length) {
      const position = itemPositions[scrollToIndex];
      scrollElementRef.current?.scrollTo({ top: position, behavior: 'smooth' });
    }
  }, [scrollToIndex, itemPositions, items.length]);

  // Render visible items
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      result.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: itemPositions[i],
            left: 0,
            right: 0,
            height: itemHeights[i],
          }}
        >
          {renderItem(items[i], i)}
        </div>
      );
    }
    return result;
  }, [visibleRange, items, itemPositions, itemHeights, renderItem]);

  if (items.length === 0) {
    return (
      <div className={`virtual-list-empty ${className}`} style={{ height }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={`virtual-list-container ${className}`}
      style={{
        height,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {visibleItems}
      </div>
    </div>
  );
}

// Optimized Transaction List with Virtual Scrolling
export const VirtualTransactionList = memo(({ transactions }: { transactions: any[] }) => {
  const renderTransaction = useCallback((transaction: any) => (
    <div className="transaction-item">
      <span className="transaction-date">{transaction.date}</span>
      <span className="transaction-description">{transaction.description}</span>
      <span className="transaction-amount">${transaction.amount.toFixed(2)}</span>
      <span className={`transaction-status status-${transaction.status}`}>
        {transaction.status}
      </span>
    </div>
  ), []);

  return (
    <VirtualList
      items={transactions}
      itemHeight={60}
      height={600}
      renderItem={renderTransaction}
      overscan={5}
      className="transaction-virtual-list"
      emptyMessage="No transactions found"
    />
  );
});

// Optimized Wallet List with Virtual Scrolling
export const VirtualWalletList = memo(({ wallets }: { wallets: any[] }) => {
  const renderWallet = useCallback((wallet: any) => (
    <div className="wallet-item">
      <div className="wallet-header">
        <h3>{wallet.name}</h3>
        <span className="wallet-type">{wallet.type}</span>
      </div>
      <div className="wallet-balance">
        ${wallet.balance.toFixed(2)} {wallet.currency}
      </div>
      <div className="wallet-address">
        {wallet.address?.substring(0, 6)}...{wallet.address?.substring(wallet.address.length - 4)}
      </div>
    </div>
  ), []);

  return (
    <VirtualList
      items={wallets}
      itemHeight={120}
      height={500}
      renderItem={renderWallet}
      overscan={3}
      className="wallet-virtual-list"
      emptyMessage="No wallets available"
    />
  );
});

// Dynamic Height Virtual List for variable content
export const DynamicVirtualList = memo(({
  items,
  estimatedItemHeight = 100,
  height = 600,
  renderItem,
  className = ''
}: any) => {
  const [itemHeights, setItemHeights] = useState<Record<number, number>>({});
  const measuredItems = useRef(new Set<number>());

  const measureItem = useCallback((index: number, element: HTMLDivElement | null) => {
    if (element && !measuredItems.current.has(index)) {
      const height = element.getBoundingClientRect().height;
      measuredItems.current.add(index);
      setItemHeights(prev => ({
        ...prev,
        [index]: height
      }));
    }
  }, []);

  const getItemHeight = useCallback((index: number) => {
    return itemHeights[index] || estimatedItemHeight;
  }, [itemHeights, estimatedItemHeight]);

  const wrappedRenderItem = useCallback((item: any, index: number) => (
    <div ref={(el) => measureItem(index, el)}>
      {renderItem(item, index)}
    </div>
  ), [renderItem, measureItem]);

  return (
    <VirtualList
      items={items}
      itemHeight={getItemHeight}
      height={height}
      renderItem={wrappedRenderItem}
      className={className}
    />
  );
});

// Infinite Scroll Virtual List
export const InfiniteVirtualList = memo(({
  items,
  loadMore,
  hasMore,
  itemHeight,
  height,
  renderItem,
  threshold = 200
}: any) => {
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback(async (scrollTop: number) => {
    const scrollPosition = scrollTop + height;
    const totalHeight = items.length * (typeof itemHeight === 'number' ? itemHeight : 100);

    if (hasMore && !loading && totalHeight - scrollPosition < threshold) {
      setLoading(true);
      await loadMore();
      setLoading(false);
    }
  }, [items.length, height, itemHeight, hasMore, loading, loadMore, threshold]);

  return (
    <>
      <VirtualList
        items={items}
        itemHeight={itemHeight}
        height={height}
        renderItem={renderItem}
        onScroll={handleScroll}
      />
      {loading && (
        <div className="loading-indicator">
          Loading more items...
        </div>
      )}
    </>
  );
});

// Table Virtual List for data tables
export const VirtualTable = memo(({
  columns,
  rows,
  rowHeight = 48,
  height = 600,
  onRowClick
}: any) => {
  const renderRow = useCallback((row: any, index: number) => (
    <div
      className="virtual-table-row"
      onClick={() => onRowClick?.(row, index)}
      style={{ display: 'flex', height: rowHeight }}
    >
      {columns.map((col: any) => (
        <div
          key={col.key}
          className="virtual-table-cell"
          style={{ flex: col.flex || 1, padding: '0 8px' }}
        >
          {row[col.key]}
        </div>
      ))}
    </div>
  ), [columns, rowHeight, onRowClick]);

  return (
    <div className="virtual-table">
      <div className="virtual-table-header" style={{ display: 'flex', height: rowHeight }}>
        {columns.map((col: any) => (
          <div
            key={col.key}
            className="virtual-table-header-cell"
            style={{ flex: col.flex || 1, padding: '0 8px', fontWeight: 'bold' }}
          >
            {col.label}
          </div>
        ))}
      </div>
      <VirtualList
        items={rows}
        itemHeight={rowHeight}
        height={height - rowHeight}
        renderItem={renderRow}
      />
    </div>
  );
});

export default VirtualList;