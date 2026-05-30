export type Article = {
  id: number;
  title: string;
  content: string;
  url: string;
  published_date: string;
  source: string;
  sentiment_score: number | null;
  crypto_mentioned: string | null;
  created_at: string;
};
