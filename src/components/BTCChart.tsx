'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, UTCTimestamp, AreaSeries, ISeriesApi, SeriesType, createSeriesMarkers } from 'lightweight-charts';

const REFRESH_MS = 61 * 60 * 1000; // 1 hour 1 minute

async function fetchBTC(
  series: ISeriesApi<SeriesType>,
  setPrice: (p: number) => void,
  setError: (e: boolean) => void,
  fitContent?: () => void,
) {
  try {
    const r = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30'
    );
    const data = await r.json();
    const prices = data.prices.map(([time, value]: [number, number]) => ({
      time: Math.floor(time / 1000) as UTCTimestamp,
      value,
    }));
    series.setData(prices);

    // --- MARKERS EXAMPLE ---
    // Find the lowest price point in the dataset
    const lowest = prices.reduce((min: typeof prices[0], p: typeof prices[0]) =>
      p.value < min.value ? p : min
    );
    createSeriesMarkers(series, [
      {
        time: lowest.time,
        position: 'belowBar',
        color: '#22c55e',
        shape: 'arrowUp',
        text: `Low $${Math.round(lowest.value).toLocaleString()}`,
      },
    ]);
    // --- END MARKERS EXAMPLE ---

    fitContent?.();
    setPrice(data.prices.at(-1)?.[1] ?? null);
  } catch {
    setError(true);
  }
}

export default function BTCChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0d0d0d' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: containerRef.current.clientWidth,
      height: 800,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#f7931a',
      topColor: 'rgba(247, 147, 26, 0.3)',
      bottomColor: 'rgba(247, 147, 26, 0)',
      lineWidth: 2,
    });

    const refresh = () =>
      fetchBTC(series, (p) => { setPrice(p); setLastUpdated(new Date()); }, setError, () =>
        chart.timeScale().fitContent()
      );

    refresh();
    const interval = setInterval(refresh, REFRESH_MS);

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div style={{ background: '#0d0d0d', borderRadius: 12, padding: 24 }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ color: '#f7931a', fontWeight: 700, fontSize: 18 }}>BTC / USD</span>
        {price && (
          <span style={{ color: '#ffffff', fontSize: 24, fontWeight: 700 }}>
            ${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        )}
      </div>
      {error ? (
        <div style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>
          Failed to load price data.
        </div>
      ) : (
        <div ref={containerRef} />
      )}
      <div style={{ color: '#6b7280', fontSize: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
        <span>30-day hourly · CoinGecko</span>
        {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}
