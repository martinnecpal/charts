'use client';

import { useState } from 'react';
import BTCChart from './BTCChart';
import type { Article } from '@/types/article';

function SentimentBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const label = score >= 0.2 ? 'Positive' : score >= 0.1 ? 'Neutral' : 'Negative';
  const color = score >= 0.2 ? '#22c55e' : score >= 0.1 ? '#f59e0b' : '#ef4444';
  return (
    <span style={{
      background: color + '22',
      color,
      border: `1px solid ${color}55`,
      borderRadius: 6,
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 600,
    }}>
      {label} {score.toFixed(2)}
    </span>
  );
}

function CryptoTags({ raw }: { raw: string | null }) {
  if (!raw) return null;
  let tags: string[] = [];
  try { tags = JSON.parse(raw); } catch { return null; }
  return (
    <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tags.map(t => (
        <span key={t} style={{
          background: '#f7931a22',
          color: '#f7931a',
          border: '1px solid #f7931a55',
          borderRadius: 6,
          padding: '2px 10px',
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>{t}</span>
      ))}
    </span>
  );
}

const TABS = ['Chart', 'News'] as const;
type Tab = typeof TABS[number];

export default function TabLayout({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<Tab>('Chart');

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid #1f2937',
        marginBottom: 32,
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              color: active === tab ? '#f7931a' : '#6b7280',
              borderBottom: active === tab ? '2px solid #f7931a' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {active === 'Chart' && <BTCChart />}

      {active === 'News' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 8px' }}>
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </p>
          {articles.map(article => (
            <div key={article.id} style={{
              background: '#0d0d0d',
              border: '1px solid #1f2937',
              borderRadius: 12,
              padding: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#ffffff', fontWeight: 600, fontSize: 17, textDecoration: 'none', flex: 1 }}
                >
                  {article.title}
                </a>
                <SentimentBadge score={article.sentiment_score} />
              </div>
              <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                {article.content}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <CryptoTags raw={article.crypto_mentioned} />
                <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 'auto' }}>
                  {article.source} · {new Date(article.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
