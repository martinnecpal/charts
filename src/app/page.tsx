import { neon } from '@neondatabase/serverless';
import TabLayout from '@/components/TabLayout';
import type { Article } from '@/types/article';

async function getArticles(): Promise<Article[]> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM articles ORDER BY published_date DESC`;
  return rows as unknown as Article[];
}

export default async function Home() {
  const articles = await getArticles();

  return (
    <main style={{ maxWidth: 2000, margin: '60px auto', padding: '0 24px' }}>
      <TabLayout articles={articles} />
    </main>
  );
}
