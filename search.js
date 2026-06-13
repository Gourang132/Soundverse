export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { q } = req.query;
  if (!q || !q.trim()) return res.status(400).json({ error: 'Query required' });
  const key = process.env.YT_API_KEY;
  if (!key) return res.status(500).json({ error: 'YT_API_KEY not set in Vercel environment variables' });
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(q)}&type=video&key=${key}`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.error) return res.status(400).json({ error: d.error.message });
    const items = (d.items || []).map(v => ({
      videoId: v.id.videoId,
      title: v.snippet.title,
      author: v.snippet.channelTitle,
      thumb: `https://i.ytimg.com/vi/${v.id.videoId}/hqdefault.jpg`
    })).filter(v => v.videoId);
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
