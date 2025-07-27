const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3000;

// 擷取 Google Trends RSS 並轉為 JSON API
app.get('/trends', async (req, res) => {
  try {
    const url = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=TW';
    const response = await axios.get(url);
    const xml = response.data;

    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('❌ XML 解析錯誤:', err);
        return res.status(500).send('XML parse error');
      }

      const items = result.rss.channel.item;
      const top25 = items.slice(0, 25).map((item, index) => ({
        index: index + 1,
        title: item.title,
        approxTraffic: item['ht:approx_traffic'] || '無資料',
        description: item.description,
      }));

      res.json({ date: result.rss.channel.pubDate, trends: top25 });
    });
  } catch (err) {
    console.error('❌ 錯誤擷取 trends:', err.message);
    res.status(500).send('Fetch failed');
  }
});

app.get('/', (req, res) => {
  res.send('✅ Google Trends RSS API Server is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
