const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🔍 Google Realtime Trends API is running!');
});

app.get('/realtime', async (req, res) => {
  try {
    const url = 'https://trends.google.com/trends/trendingsearches/realtime?geo=TW&category=all';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const scriptData = $('script')
      .map((i, el) => $(el).html())
      .get()
      .find(str => str.includes('window.__NEXT_DATA__'));

    const jsonStr = scriptData.match(/window\.__NEXT_DATA__ = (.*);/)[1];
    const trendsData = JSON.parse(jsonStr);
    const items = trendsData.props.pageProps.trendingSearches[0].trendingSearchesDays[0].trendingSearches;

    const result = items.map((item, i) => ({
      index: i + 1,
      title: item.title.query,
      traffic: item.formattedTraffic,
      articles: item.articles.map(a => ({
        title: a.title,
        source: a.source,
        timeAgo: a.timeAgo,
        url: a.url
      }))
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ Realtime error:', error.message);
    res.status(500).send('❌ 即時熱搜抓取失敗');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
