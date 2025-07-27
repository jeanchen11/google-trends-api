// server.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Welcome to Google Trends API');
});

app.get('/trends', async (req, res) => {
  try {
    const url = 'https://trends.google.com/trends/trendingsearches/daily?geo=TW';
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const jsonDataMatch = html.match(/window\.__NEXT_DATA__ = (.*);<\/script>/);
    if (!jsonDataMatch || jsonDataMatch.length < 2) {
      throw new Error('❌ 無法解析 trends 資料');
    }

    const jsonData = JSON.parse(jsonDataMatch[1]);
    const trendItems =
      jsonData.props.pageProps.trendingSearchesDays?.[0]?.trendingSearches || [];

    const trends = trendItems.map(item => ({
      title: item.title.query,
      traffic: item.formattedTraffic,
      snippet: item.title.shareText,
      link: item.shareUrl,
    }));

    res.json(trends);
  } catch (err) {
    console.error('❌ Error fetching trends:', err);
    res.status(500).send('❌ Failed to fetch trends');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
